import { useState, useEffect } from 'react';
import savingsData from '../data/savings.json';

export default function TotalSavings({ onClose, showPopup }) {
  const [isVisible, setIsVisible] = useState(false);
  const [savings] = useState(getWeeklySavings(savingsData.savings_data.daily_savings));

  function getWeeklySavings(dailyData) {
    const weeks = [];
    for (let i = 0; i < dailyData.length; i += 7) {
      const weekData = dailyData.slice(i, i + 7);
      // Calculate total for the week instead of average
      const weekTotal = weekData.reduce((sum, day) => sum + day.amount, 0);
      const weekStart = weekData[0].date;
      weeks.push({
        date: `Week ${Math.floor(i/7) + 1}`,
        amount: weekTotal, // Use total instead of average
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

  const handleInvest = () => {
    console.log('Invest clicked');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
        {/* Total Savings Header */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-3xl font-bold text-center text-blue-800 mb-2">
            TOTAL SAVINGS
          </h3>
          <p className="text-6xl font-bold text-blue-600 text-center">
            RM {totalSavings.toFixed(2)}
          </p>
        </div>

        {/* Bar Chart */}
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

        {/* Statistics Grid */}
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

        {/* Action Buttons */}
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
      </div>
    </div>
  );
}

// Add this CSS to your global styles or within the component if using styled-components
const styles = `
  @keyframes growUp {
    from {
      height: 0;
    }
    to {
      height: var(--final-height);
    }
  }
`; 