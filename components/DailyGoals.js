import { useState, useEffect } from 'react';

export default function DailyGoals({ onClose, showPopup }) {
  const [aggregatedGoals, setAggregatedGoals] = useState(null);

  useEffect(() => {
    fetchAndAggregateGoals();
  }, [showPopup]);

  const formatGoalType = (goalType) => {
    if (!goalType) return 'Other';
    return goalType.charAt(0).toUpperCase() + goalType.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const fetchAndAggregateGoals = async () => {
    try {
      const response = await fetch('/api/getDailyGoals');
      const data = await response.json();
      
      if (data.goals && data.goals.length > 0) {
        // Get unique financial goals (latest version of each goal type)
        const uniqueGoals = Object.values(data.goals.reduce((acc, goal) => {
          const [plan] = goal.recommendations[0].match(/\$[\d,]+\.?\d*/); // Extract amount from first recommendation
          const targetAmount = parseFloat(plan.replace(/[$,]/g, ''));
          
          // Use financial goal type as the key
          const goalKey = goal.financialGoal || 'other';
          
          // Keep only the latest entry for each unique goal
          if (!acc[goalKey] || new Date(goal.timestamp) > new Date(acc[goalKey].timestamp)) {
            acc[goalKey] = goal;
          }
          return acc;
        }, {}));

        // Calculate aggregated values
        const totalDailySavings = uniqueGoals.reduce((sum, goal) => 
          sum + parseFloat(goal.dailySavingsTarget), 0
        );

        // Find the longest time to goal
        const maxDaysToGoal = Math.max(...uniqueGoals.map(goal => goal.daysToGoal));
        
        // Use the daily disposable income from the most recent goal
        const latestGoal = uniqueGoals.reduce((latest, current) => 
          new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
        );

        const dailyDisposableIncome = parseFloat(latestGoal.dailyDisposableIncome);
        const monthlyDebtPayment = parseFloat(latestGoal.monthlyDebtPayment);

        // Generate new recommendations
        const recommendations = [
          `Save $${totalDailySavings.toFixed(2)} daily to reach all your goals`,
          `Available daily spending: $${dailyDisposableIncome.toFixed(2)}`,
          `Monthly debt payment: $${monthlyDebtPayment.toFixed(2)}`,
        ];

        // Add individual goal breakdowns
        uniqueGoals.forEach(goal => {
          const [savingsRec] = goal.recommendations[0].match(/\$[\d,]+\.?\d*/);
          recommendations.push(
            `${formatGoalType(goal.financialGoal)}: ${savingsRec} daily (${goal.daysToGoal} days remaining)`
          );
        });

        // Add feasibility warning if needed
        if (totalDailySavings > dailyDisposableIncome) {
          recommendations.push(
            "⚠️ Warning: Your combined savings targets exceed your disposable income. Consider adjusting your goals or timeline."
          );
        } else {
          recommendations.push(
            "Your combined goals appear achievable with your current income!"
          );
        }

        setAggregatedGoals({
          dailySavingsTarget: totalDailySavings.toFixed(2),
          daysToGoal: maxDaysToGoal,
          dailyDisposableIncome: dailyDisposableIncome.toFixed(2),
          monthlyDebtPayment: monthlyDebtPayment.toFixed(2),
          recommendations,
          numberOfGoals: uniqueGoals.length
        });
      }
    } catch (error) {
      console.error('Error fetching daily goals:', error);
    }
  };

  if (!aggregatedGoals || !showPopup) return null;

  return (
    <div className="absolute left-4 top-20 bg-white rounded-lg shadow-xl p-6 w-96 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Combined Financial Goals ({aggregatedGoals.numberOfGoals})</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="font-semibold text-blue-800">Total Daily Savings Target</p>
          <p className="text-2xl font-bold text-blue-600">${aggregatedGoals.dailySavingsTarget}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Longest goal timeline: {aggregatedGoals.daysToGoal} days</p>
          <p className="text-sm text-gray-600">Daily spending limit: ${aggregatedGoals.dailyDisposableIncome}</p>
          <p className="text-sm text-gray-600">Monthly debt payment: ${aggregatedGoals.monthlyDebtPayment}</p>
        </div>

        <div className="mt-4 space-y-2">
          <h4 className="font-semibold text-gray-700">Goal Breakdown & Recommendations:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {aggregatedGoals.recommendations.map((rec, index) => (
              <li 
                key={index} 
                className={`text-sm ${
                  rec.includes('⚠️') ? 'text-red-600 font-medium' : 
                  rec.includes('achievable') ? 'text-green-600 font-medium' : 
                  'text-gray-600'
                }`}
              >
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 