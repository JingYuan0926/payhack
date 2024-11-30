import { useState, useEffect } from 'react';

export default function DailyGoals({ onClose, showPopup }) {
  const [aggregatedGoals, setAggregatedGoals] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showPopup) {
      fetchAndAggregateGoals();
      // Delay setting visibility to true to allow fade in
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
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
          // Use financial goal type as the key
          const goalKey = goal.financialGoal || 'other';

          // Keep only the latest entry for each unique goal type
          if (!acc[goalKey] || new Date(goal.timestamp) > new Date(acc[goalKey].timestamp)) {
            acc[goalKey] = goal;
          }
          return acc;
        }, {}));

        // Calculate total daily savings (sum of all goals)
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

        // Generate aggregated recommendations
        const recommendations = [
          `Total daily savings needed: RM ${totalDailySavings.toFixed(2)}`,
          `Available daily spending: RM ${dailyDisposableIncome.toFixed(2)}`,
          `Monthly debt payment: RM ${monthlyDebtPayment.toFixed(2)}`,
        ];

        // Add individual goal breakdowns
        uniqueGoals.forEach(goal => {
          recommendations.push(
            `${formatGoalType(goal.financialGoal)}: RM ${goal.dailySavingsTarget} daily (${goal.daysToGoal} days remaining)`
          );
        });

        // Add feasibility warning if needed
        if (totalDailySavings > dailyDisposableIncome) {
          recommendations.push(
            "⚠️ Warning: Your combined savings targets (RM " +
            totalDailySavings.toFixed(2) +
            ") exceed your daily disposable income (RM " +
            dailyDisposableIncome.toFixed(2) +
            "). Consider adjusting your goals or timeline."
          );
        } else {
          const remainingDaily = dailyDisposableIncome - totalDailySavings;
          recommendations.push(
            `✅ Your combined goals are achievable! You'll have RM ${remainingDaily.toFixed(2)} remaining daily after savings.`
          );
        }

        setAggregatedGoals({
          dailySavingsTarget: totalDailySavings.toFixed(2),
          daysToGoal: maxDaysToGoal,
          dailyDisposableIncome: dailyDisposableIncome.toFixed(2),
          monthlyDebtPayment: monthlyDebtPayment.toFixed(2),
          recommendations,
          numberOfGoals: uniqueGoals.length,
          goals: uniqueGoals // Add this to access individual goals if needed
        });
      }
    } catch (error) {
      console.error('Error fetching daily goals:', error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Wait for fade out animation to complete before calling onClose
    setTimeout(onClose, 300);
  };

  if (!aggregatedGoals || !showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-4xl font-bold pixel-text-blue">Combined Financial Goals ({aggregatedGoals.numberOfGoals})</h3>
        </div>

        <div className="space-y-4 overflow-y-auto">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="font-semibold text-blue-800 text-2xl">Total Daily Savings Target</p>
            <p className="text-5xl font-bold text-blue-600">RM {aggregatedGoals.dailySavingsTarget}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xl text-gray-600">Longest goal timeline: {aggregatedGoals.daysToGoal} days</p>
            <p className="text-xl text-gray-600">Daily spending limit: RM {aggregatedGoals.dailyDisposableIncome}</p>
            <p className="text-xl text-gray-600">Monthly debt payment: RM {aggregatedGoals.monthlyDebtPayment}</p>
          </div>

          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-gray-700 text-2xl">Goal Breakdown & Recommendations:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {aggregatedGoals.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className={`text-xl ${rec.includes('⚠️') ? 'text-red-600 font-medium' :
                      rec.includes('achievable') ? 'text-green-600 font-medium' :
                        'text-gray-600'
                    }`}
                >
                  {rec.replace(/\$/g, 'RM')}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="text-xl px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleClose}
            className="text-xl px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
} 