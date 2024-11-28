import { useState, useEffect } from 'react';

export default function FinancialPlanPopup({ onClose, username, onGoalsUpdate }) {
  const [financialData, setFinancialData] = useState({
    financialGoal: '',
    targetAmount: '',
    targetDate: '',
    salary: '5000',
    loansAndDebts: '15000',
  });

  useEffect(() => {
    setFinancialData(prev => ({
      ...prev,
      salary: '5000',
      loansAndDebts: '1500'
    }));
  }, []);

  const calculateDailyGoals = (data) => {
    const today = new Date();
    const targetDate = new Date(data.targetDate);
    const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    const monthlySalary = parseFloat(data.salary);
    const totalDebts = parseFloat(data.loansAndDebts);
    const targetAmount = parseFloat(data.targetAmount);

    // Calculate daily savings needed
    const dailySavingsNeeded = targetAmount / daysRemaining;
    
    // Calculate monthly disposable income (after debt payments)
    const monthlyDebtPayment = totalDebts * 0.1; // Assuming 10% of debt as monthly payment
    const disposableIncome = monthlySalary - monthlyDebtPayment;
    
    // Calculate daily disposable income
    const dailyDisposableIncome = disposableIncome / 30;

    return {
      financialGoal: data.financialGoal,
      dailySavingsTarget: dailySavingsNeeded.toFixed(2),
      daysToGoal: daysRemaining,
      dailyDisposableIncome: dailyDisposableIncome.toFixed(2),
      monthlyDebtPayment: monthlyDebtPayment.toFixed(2),
      recommendations: [
        `Save $${dailySavingsNeeded.toFixed(2)} daily to reach your goal`,
        `Available daily spending: $${dailyDisposableIncome.toFixed(2)}`,
        `Monthly debt payment: $${monthlyDebtPayment.toFixed(2)}`,
        dailySavingsNeeded > dailyDisposableIncome 
          ? "Warning: Your target savings exceed your disposable income. Consider extending your target date or adjusting your goal amount."
          : "Your goal appears achievable with your current income!"
      ]
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dailyGoals = calculateDailyGoals(financialData);
      
      const data = {
        financialPlan: {
          username,
          ...financialData,
          timestamp: new Date().toISOString(),
        },
        dailyGoals: {
          username,
          ...dailyGoals,
          timestamp: new Date().toISOString(),
        }
      };

      const response = await fetch('/api/saveFinancialPlan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        if (onGoalsUpdate) {
          onGoalsUpdate();
        }
        alert(`Financial plan saved successfully!\n\nDaily Goals Summary:\n${dailyGoals.recommendations.join('\n')}`);
        onClose();
      } else {
        alert('Failed to save financial plan');
      }
    } catch (error) {
      console.error('Error saving financial plan:', error);
      alert('Error saving financial plan');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
        <h2 className="text-3xl font-bold mb-4">Financial Plan</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xl block text-sm font-medium text-gray-700">
              What is your financial goal?
            </label>
            <select
              value={financialData.financialGoal}
              onChange={(e) => setFinancialData(prev => ({
                ...prev,
                financialGoal: e.target.value
              }))}
              className="text-xl mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              required
            >
              <option value="">Select a goal</option>
              <option value="house">Buy a House</option>
              <option value="car">Buy a Car</option>
              <option value="education">Education</option>
              <option value="retirement">Retirement Savings</option>
              <option value="emergency">Emergency Fund</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-xl block text-sm font-medium text-gray-700">
              How much money do you need to achieve this goal?
            </label>
            <input
              type="number"
              value={financialData.targetAmount}
              onChange={(e) => setFinancialData(prev => ({
                ...prev,
                targetAmount: e.target.value
              }))}
              className="text-xl mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              placeholder="Enter target amount"
              required
            />
          </div>

          <div>
            <label className="text-xl block text-sm font-medium text-gray-700">
              By what date do you want to reach this goal?
            </label>
            <input
              type="date"
              value={financialData.targetDate}
              onChange={(e) => setFinancialData(prev => ({
                ...prev,
                targetDate: e.target.value
              }))}
              className="text-xl mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="bg-gray-50 p-1 rounded-lg">
            <h3 className="text-2xl font-medium text-gray-900 mb-3">Current Financial Status</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xl block text-sm font-medium text-gray-700">
                  Current Monthly Salary
                </label>
                <input
                  type="text"
                  value={`$${financialData.salary}`}
                  className="text-xl mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 p-2"
                  readOnly
                />
              </div>

              <div>
                <label className="text-xl block text-sm font-medium text-gray-700">
                  Current Loans & Debts
                </label>
                <input
                  type="text"
                  value={`$${financialData.loansAndDebts}`}
                  className="text-xl mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 p-2"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="text-xl px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xl px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 