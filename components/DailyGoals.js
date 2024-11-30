import { useState, useEffect } from 'react';

export default function DailyGoals({ onClose, showPopup }) {
  const [aggregatedGoals, setAggregatedGoals] = useState(null);
  const [dailyPlan, setDailyPlan] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showPopup) {
      fetchAndAggregateGoals();
      fetchDailyPlan();
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [showPopup]);

  const fetchDailyPlan = async () => {
    try {
      const response = await fetch('/api/getDailyPlan');
      const data = await response.json();
      if (data.plan) {
        setDailyPlan(data.plan);
      }
    } catch (error) {
      console.error('Error fetching daily plan:', error);
    }
  };

  const formatGoalType = (goalType) => {
    if (!goalType) return 'Other';
    return goalType.charAt(0).toUpperCase() + goalType.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const fetchAndAggregateGoals = async () => {
    try {
      const response = await fetch('/api/getDailyPlan');
      const data = await response.json();

      if (!data.plan) {
        setAggregatedGoals({
          dailySavingsTarget: "0.00",
          daysToGoal: 0,
          dailyDisposableIncome: "0.00",
          monthlyDebtPayment: "0.00",
          recommendations: ["No financial goals set yet."],
          numberOfGoals: 0,
          goals: []
        });
        return;
      }

      const plan = data.plan;
      const dailySavingsAmount = typeof plan.dailySavings === 'object' 
        ? plan.dailySavings.max 
        : plan.dailySavings;

      // Assume daily disposable income is 20% more than required savings for demo
      const estimatedDailyDisposable = dailySavingsAmount * 1.2;
      const estimatedMonthlyDebt = dailySavingsAmount * 30 * 0.3; // 30% of monthly savings as debt

      // Generate recommendations
      const recommendations = [
        `Total daily savings needed: RM ${dailySavingsAmount.toFixed(2)}`,
        `Available daily spending: RM ${estimatedDailyDisposable.toFixed(2)}`,
        `Monthly debt payment: RM ${estimatedMonthlyDebt.toFixed(2)}`,
        `Goal: ${plan.goal} - RM ${plan.targetAmount.toFixed(2)}`,
      ];

      // Add feasibility check
      if (dailySavingsAmount > estimatedDailyDisposable) {
        recommendations.push(
          "⚠️ Warning: Your savings target exceeds your estimated daily disposable income. " +
          "Consider adjusting your goal or timeline."
        );
      } else {
        const remainingDaily = estimatedDailyDisposable - dailySavingsAmount;
        recommendations.push(
          `✅ Your goal is achievable! You'll have RM ${remainingDaily.toFixed(2)} remaining daily after savings.`
        );
      }

      setAggregatedGoals({
        dailySavingsTarget: dailySavingsAmount.toFixed(2),
        daysToGoal: typeof plan.daysToGoal === 'object' ? plan.daysToGoal.max : plan.daysToGoal,
        dailyDisposableIncome: estimatedDailyDisposable.toFixed(2),
        monthlyDebtPayment: estimatedMonthlyDebt.toFixed(2),
        recommendations,
        numberOfGoals: 1,
        goals: [plan]
      });

    } catch (error) {
      console.error('Error fetching daily plan:', error);
      setAggregatedGoals({
        dailySavingsTarget: "0.00",
        daysToGoal: 0,
        dailyDisposableIncome: "0.00",
        monthlyDebtPayment: "0.00",
        recommendations: ["Error loading plan. Please try again."],
        numberOfGoals: 0,
        goals: []
      });
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
          <h3 className="text-4xl font-bold pixel-text-blue">
            Daily Financial Goals
          </h3>
        </div>

        {/* Show Daily Plan if exists */}
        {dailyPlan && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="text-2xl font-semibold text-blue-800 mb-2">Your Savings Goal</h4>
            <div className="space-y-2">
              <p className="text-xl">Goal: {dailyPlan.goal}</p>
              <p className="text-xl">Target: RM {dailyPlan.targetAmount.toFixed(2)}</p>
              <p className="text-xl">Daily Savings Required: RM {
                typeof dailyPlan.dailySavings === 'object' 
                  ? `${dailyPlan.dailySavings.min.toFixed(2)} - ${dailyPlan.dailySavings.max.toFixed(2)}`
                  : dailyPlan.dailySavings.toFixed(2)
              }</p>
              <p className="text-xl">Days to Goal: {
                typeof dailyPlan.daysToGoal === 'object'
                  ? `${dailyPlan.daysToGoal.min} - ${dailyPlan.daysToGoal.max}`
                  : dailyPlan.daysToGoal
              } days</p>
              <p className="text-xl">Plan Type: {dailyPlan.planType === 'strict' ? 'Strict' : 'Flexible'}</p>
            </div>
          </div>
        )}

        {/* Existing aggregated goals section */}
        <div className="space-y-4 overflow-y-auto">
          {aggregatedGoals && (
            <>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-blue-800 text-2xl">Total Daily Savings Target</p>
                <p className="text-5xl font-bold text-blue-600">RM {aggregatedGoals.dailySavingsTarget}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xl text-gray-600">Daily spending limit: RM {aggregatedGoals.dailyDisposableIncome}</p>
                <p className="text-xl text-gray-600">Monthly debt payment: RM {aggregatedGoals.monthlyDebtPayment}</p>
              </div>

              {/* Feasibility Check */}
              {dailyPlan && aggregatedGoals && (
                <div className={`p-4 rounded-lg ${
                  parseFloat(aggregatedGoals.dailyDisposableIncome) >= 
                  (typeof dailyPlan.dailySavings === 'object' ? dailyPlan.dailySavings.max : dailyPlan.dailySavings)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {parseFloat(aggregatedGoals.dailyDisposableIncome) >= 
                   (typeof dailyPlan.dailySavings === 'object' ? dailyPlan.dailySavings.max : dailyPlan.dailySavings)
                    ? "✅ Your savings goal is achievable with your current income!"
                    : "⚠️ Your savings goal might be challenging. Consider adjusting your target or timeline."
                  }
                </div>
              )}

              <div className="mt-4 space-y-2">
                <h4 className="font-semibold text-gray-700 text-2xl">Recommendations:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {aggregatedGoals.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className={`text-xl ${
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
            </>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="text-xl px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
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