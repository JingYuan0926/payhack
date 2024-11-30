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
      
      // Use the values directly from the plan instead of calculating
      setAggregatedGoals({
        dailySavingsTarget: typeof plan.dailySavings === 'object' 
          ? `${plan.dailySavings.min.toFixed(2)} - ${plan.dailySavings.max.toFixed(2)}`
          : plan.dailySavings.toFixed(2),
        daysToGoal: typeof plan.daysToGoal === 'object' 
          ? `${plan.daysToGoal.min} - ${plan.daysToGoal.max}`
          : plan.daysToGoal,
        dailyDisposableIncome: plan.dailyDisposableIncome.toFixed(2),
        monthlyDebtPayment: plan.monthlyDebt.toFixed(2),
        recommendations: [
          `Goal: ${plan.goal} - RM ${plan.targetAmount.toFixed(2)}`,
          `Daily spending limit: RM ${plan.dailyLimit.toFixed(2)}`,
          `Monthly debt payment: RM ${plan.monthlyDebt.toFixed(2)}`,
          typeof plan.remainingDaily === 'object'
            ? `✅ Your goal is achievable! You'll have RM ${plan.remainingDaily.min.toFixed(2)} - RM ${plan.remainingDaily.max.toFixed(2)} remaining daily after savings.`
            : `✅ Your goal is achievable! You'll have RM ${plan.remainingDaily.toFixed(2)} remaining daily after savings.`
        ],
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
    setTimeout(onClose, 300);
  };

  if (!aggregatedGoals || !showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-4xl font-bold pixel-text-blue">
            Financial Goals Summary
          </h3>
        </div>

        <div className="space-y-4 overflow-y-auto">
          {/* Daily Savings Required - with blue background */}
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <div className="text-center">
              <p className="font-semibold text-blue-800 text-2xl">Daily Savings Required</p>
              <p className="text-5xl font-bold text-blue-600">
                {dailyPlan ? (
                  typeof dailyPlan.dailySavings === 'object' ? (
                    `RM ${dailyPlan.dailySavings.min.toFixed(2)} - ${dailyPlan.dailySavings.max.toFixed(2)}`
                  ) : (
                    `RM ${Number(dailyPlan.dailySavings).toFixed(2)}`
                  )
                ) : (
                  'RM 0.00'
                )}
              </p>
            </div>
          </div>

          {/* Other plan details - without blue background */}
          <div className="space-y-2">
            <p className="text-lg">Goal: {dailyPlan?.goal || 'No goal set'}</p>
            <p className="text-lg">Target Amount: RM {Number(dailyPlan?.targetAmount || 0).toFixed(2)}</p>
            <p className="text-lg">
              Timeline: {
                typeof dailyPlan?.daysToGoal === 'object' 
                  ? `${dailyPlan.daysToGoal.min} - ${dailyPlan.daysToGoal.max} days`
                  : `${dailyPlan?.daysToGoal || 0} days`
              }
            </p>
            <p className="text-lg">Plan Type: {dailyPlan?.planType === 'strict' ? 'Strict' : 'Flexible'}</p>
            <p className="text-lg">Daily spending limit: RM {dailyPlan?.dailyLimit?.toFixed(2) || '0.00'}</p>
            <p className="text-lg">Monthly debt payment: RM {dailyPlan?.monthlyDebt?.toFixed(2) || '0.00'}</p>
            
            {/* Remaining daily message with green background */}
            {dailyPlan && (
              <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500 mt-4">
                <p className="text-lg text-green-700">
                  {typeof dailyPlan.remainingDaily === 'object' ? (
                    `✅ Your goal is achievable! You'll have RM ${dailyPlan.remainingDaily.min.toFixed(2)} - RM ${dailyPlan.remainingDaily.max.toFixed(2)} remaining daily after savings.`
                  ) : (
                    `✅ Your goal is achievable! You'll have RM ${dailyPlan.remainingDaily.toFixed(2)} remaining daily after savings.`
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="text-xl px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 