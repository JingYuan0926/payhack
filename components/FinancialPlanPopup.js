import { useState, useEffect } from 'react';

export default function FinancialPlanPopup({ onClose, username, onGoalsUpdate }) {
  const [financialData, setFinancialData] = useState({
    financialGoal: '',
    goalDescription: '',
    targetAmount: '',
    targetDate: '',
    savingStyle: 'flexible',
    monthlyIncome: 0,
    monthlyExpenses: 0,
    disposableIncome: 0
  });

  const [spendingAnalysis, setSpendingAnalysis] = useState({
    categories: {},
    monthlyAverages: {
      bills: 0,
      food: 0,
      transportation: 0,
      transfers: 0,
      others: 0
    },
    totalMonthlyExpense: 0
  });

  useEffect(() => {
    // Fetch and analyze spending data
    const fetchFinancialData = async () => {
      try {
        const response = await fetch('/api/getTransactions');
        const data = await response.json();
        
        // Analyze spending patterns from all payment channels
        const analysis = analyzeSpendingPatterns(data.payment_channels);
        setSpendingAnalysis(analysis);

        // Calculate disposable income
        const monthlyIncome = calculateMonthlyIncome(data);
        setFinancialData(prev => ({
          ...prev,
          monthlyIncome: monthlyIncome,
          monthlyExpenses: analysis.totalMonthlyExpense,
          disposableIncome: monthlyIncome - analysis.totalMonthlyExpense
        }));
      } catch (error) {
        console.error('Error fetching transaction data:', error);
      }
    };

    fetchFinancialData();
  }, []);

  const analyzeSpendingPatterns = (paymentChannels) => {
    const allTransactions = [];
    
    // Collect transactions from all payment channels
    if (paymentChannels.ewallet) {
      allTransactions.push(...paymentChannels.ewallet.usages);
    }
    if (paymentChannels.credit_cards) {
      paymentChannels.credit_cards.forEach(card => {
        allTransactions.push(...card.usages);
      });
    }
    if (paymentChannels.bank_accounts) {
      paymentChannels.bank_accounts.forEach(account => {
        allTransactions.push(...account.usages);
      });
    }

    // Group transactions by category and calculate monthly averages
    const categories = {};
    allTransactions.forEach(transaction => {
      const category = transaction.category;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(transaction.amount);
    });

    // Calculate monthly averages for each spending category
    const monthlyAverages = {
      bills: calculateMonthlyAverage(categories['Bills'] || []),
      food: calculateMonthlyAverage(categories['Food & Beverage'] || []),
      transportation: calculateMonthlyAverage(categories['Transportation'] || []),
      transfers: calculateMonthlyAverage(categories['Transfer'] || []),
      others: calculateMonthlyAverage(
        Object.entries(categories)
          .filter(([key]) => !['Bills', 'Food & Beverage', 'Transportation', 'Transfer'].includes(key))
          .flatMap(([_, amounts]) => amounts)
      )
    };

    const totalMonthlyExpense = Object.values(monthlyAverages).reduce((a, b) => a + b, 0);

    return {
      categories,
      monthlyAverages,
      totalMonthlyExpense
    };
  };

  const calculateFeasibility = (data) => {
    const monthsToGoal = getMonthsBetweenDates(new Date(), new Date(data.targetDate));
    const requiredMonthlySaving = data.targetAmount / monthsToGoal;
    
    // Calculate discretionary spending (non-essential expenses)
    const discretionarySpending = spendingAnalysis.monthlyAverages.food + 
                                 spendingAnalysis.monthlyAverages.others;
    
    // Calculate potential savings if reducing discretionary spending
    const potentialMonthlySavings = data.disposableIncome + (discretionarySpending * 0.3); // Assume 30% reduction possible
    
    const feasibilityScore = (potentialMonthlySavings / requiredMonthlySaving) * 100;

    return {
      feasible: feasibilityScore >= 70,
      requiredMonthlySaving,
      feasibilityScore,
      potentialSavings: potentialMonthlySavings,
      recommendations: generateRecommendations(
        feasibilityScore, 
        data, 
        spendingAnalysis,
        requiredMonthlySaving
      )
    };
  };

  const generateRecommendations = (feasibilityScore, data, spending, requiredSaving) => {
    let recommendations = [];
    
    if (feasibilityScore >= 70) {
      recommendations.push("Your goal appears achievable!");
      if (data.savingStyle === 'flexible') {
        const dailyMin = (requiredSaving * 0.7) / 30;
        const dailyMax = (requiredSaving * 1.3) / 30;
        recommendations.push(`Recommended daily saving: $${dailyMin.toFixed(2)} - $${dailyMax.toFixed(2)}`);
      } else {
        recommendations.push(`Required daily saving: $${(requiredSaving / 30).toFixed(2)}`);
      }
    } else {
      recommendations.push("This goal may be challenging with current spending.");
      recommendations.push(`Consider reducing:`);
      recommendations.push(`- Food expenses (current: $${spending.monthlyAverages.food.toFixed(2)}/month)`);
      recommendations.push(`- Transportation (current: $${spending.monthlyAverages.transportation.toFixed(2)}/month)`);
      recommendations.push(`- Other discretionary spending (current: $${spending.monthlyAverages.others.toFixed(2)}/month)`);
    }

    return recommendations;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-4">Financial Goal Planning</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              What are you saving for?
            </label>
            <input
              type="text"
              value={financialData.goalDescription}
              onChange={(e) => setFinancialData(prev => ({
                ...prev,
                goalDescription: e.target.value
              }))}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              placeholder="e.g., Trip to Europe, Car down payment"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target Amount
            </label>
            <input
              type="number"
              value={financialData.targetAmount}
              onChange={(e) => setFinancialData(prev => ({
                ...prev,
                targetAmount: e.target.value
              }))}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              placeholder="Enter amount needed"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target Date
            </label>
            <input
              type="date"
              value={financialData.targetDate}
              onChange={(e) => setFinancialData(prev => ({
                ...prev,
                targetDate: e.target.value
              }))}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Saving Style
            </label>
            <select
              value={financialData.savingStyle}
              onChange={(e) => setFinancialData(prev => ({
                ...prev,
                savingStyle: e.target.value
              }))}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            >
              <option value="flexible">Flexible (variable daily amounts)</option>
              <option value="strict">Strict (fixed daily amount)</option>
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Current Financial Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Monthly Income</p>
                <p className="text-lg font-medium">${financialData.monthlyIncome}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Expenses</p>
                <p className="text-lg font-medium">${financialData.monthlyExpenses}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Disposable Income</p>
                <p className="text-lg font-medium">${financialData.disposableIncome}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 