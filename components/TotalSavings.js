import { useState, useEffect } from 'react';
import savingsData from '../data/savings.json';
import incomeData from '../data/income.json';
import Deposit from './Deposit';

export default function TotalSavings({ onClose, showPopup }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [savings] = useState(getWeeklySavings(savingsData.savings_data.daily_savings));
  const [investmentAdvice, setInvestmentAdvice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  function getWeeklySavings(dailyData) {
    const weeks = [];
    for (let i = 0; i < dailyData.length; i += 7) {
      const weekData = dailyData.slice(i, i + 7);
      const weekTotal = weekData.reduce((sum, day) => sum + day.amount, 0);
      const weekStart = weekData[0].date;
      weeks.push({
        date: `Week ${Math.floor(i/7) + 1}`,
        amount: weekTotal,
        tooltip: `${weekStart} - ${weekData[weekData.length-1]?.date}`
      });
    }
    return weeks;
  }

  useEffect(() => {
    if (showPopup) {
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [showPopup]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleConfirm = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      handleClose();
    }, 2000);
  };

  const getInvestmentAdvice = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/getInvestmentAdvice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          income: incomeData.user,
          savings: savingsData.savings_data
        }),
      });

      const data = await response.json();
      setInvestmentAdvice(data);
    } catch (error) {
      console.error('Error getting investment advice:', error);
    }
    setIsLoading(false);
  };

  const handleInvest = async () => {
    setShowDeposit(true);
    if (!investmentAdvice) {
      await getInvestmentAdvice();
    }
  };

  const getBarHeight = (amount) => {
    const maxAmount = Math.max(...savings.map(week => week.amount));
    return (amount / maxAmount) * 70;
  };

  const totalSavings = savingsData.savings_data.daily_savings.reduce((acc, curr) => acc + curr.amount, 0);
  const avgSavings = totalSavings / savingsData.savings_data.daily_savings.length;
  const highestSaving = Math.max(...savingsData.savings_data.daily_savings.map(d => d.amount));
  const lowestSaving = Math.min(...savingsData.savings_data.daily_savings.map(d => d.amount));

  if (!showPopup) return null;

  const AdviceCard = ({ title, bank, percentage, amount, className }) => (
    <div className={`${className} p-4 rounded-lg shadow-sm`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="space-y-1">
        {bank && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Bank:</span>
            <span className="text-xl font-bold">{bank}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Percentage:</span>
          <span className="text-2xl font-bold">{percentage}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount:</span>
          <span className="text-2xl font-bold">RM {amount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[500px] max-h-[100vh] overflow-y-auto">
        {showSuccess ? (
          <div className="text-center py-8">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-800">Transaction Successful!</h2>
          </div>
        ) : !showDeposit ? (
          <>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="text-3xl font-bold text-center text-blue-800 mb-2">
                TOTAL SAVINGS
              </h3>
              <p className="text-6xl font-bold text-blue-600 text-center">
                RM {totalSavings.toFixed(2)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg mb-6">
              <h4 className="text-2xl font-bold mb-4">WEEKLY SAVINGS TREND (RM)</h4>
              <div className="flex items-end justify-between h-64 gap-4">
                {savings.map((week, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="w-full relative" style={{ height: '200px' }}>
                      <div 
                        className={`w-full absolute bottom-0 rounded-t-lg transition-all duration-500 ${
                          index === savings.length - 1 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ 
                          height: `${getBarHeight(week.amount)}%`,
                          animation: 'growUp 1s ease-out'
                        }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xl font-bold">
                          {week.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-lg font-bold text-center">
                      {week.date}
                      <div className="text-xs text-gray-500">{week.tooltip}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600 text-lg font-bold">AVERAGE</p>
                <p className="text-3xl font-bold text-gray-800">
                  RM {avgSavings.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600 text-lg font-bold">HIGHEST</p>
                <p className="text-3xl font-bold text-green-600">
                  RM {highestSaving.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600 text-lg font-bold">LOWEST</p>
                <p className="text-3xl font-bold text-red-600">
                  RM {lowestSaving.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleInvest}
                className="text-2xl px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 font-bold"
              >
                INVEST
              </button>
              <button
                onClick={handleClose}
                className="text-2xl px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-bold"
              >
                CLOSE
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => setShowDeposit(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Savings
            </button>
            
            <Deposit />
            
            <div className="text-center text-gray-600 mt-4">
              {isLoading ? (
                <div className="text-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-lg font-medium text-gray-600">Analyzing your financial data...</p>
                </div>
              ) : investmentAdvice && investmentAdvice.fixedDeposit ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-center mb-6">INVESTMENT RECOMMENDATION</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <AdviceCard
                      title="Fixed Deposit"
                      bank={investmentAdvice.fixedDeposit.bank || ''}
                      percentage={investmentAdvice.fixedDeposit.percentage || 0}
                      amount={investmentAdvice.fixedDeposit.amount || 0}
                      className="bg-green-50 border border-green-100"
                    />
                    <AdviceCard
                      title="Savings Account"
                      percentage={investmentAdvice.savingsAccount?.percentage || 0}
                      amount={investmentAdvice.savingsAccount?.amount || 0}
                      className="bg-blue-50 border border-blue-100"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <h3 className="text-lg font-semibold mb-2">RECOMMENDATION RATIONALE</h3>
                    <p className="text-gray-600">
                      {investmentAdvice.explanation || 'No explanation provided'}
                    </p>
                  </div>

                  <button
                    onClick={handleConfirm}
                    className="w-full py-3 bg-green-500 text-white rounded-md hover:bg-green-600 font-bold text-xl transition-colors"
                  >
                    CONFIRM
                  </button>
                </div>
              ) : (
                <p className="text-center text-gray-600">No investment advice available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}