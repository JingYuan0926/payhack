import { useState, useEffect } from 'react';
import { analyzeFinances } from '../pages/api/financial-analysis';

export default function FinancialPlanPopup({ onClose, username, openApiData, incomeData }) {
  const [step, setStep] = useState(1);
  const [financialData, setFinancialData] = useState({
    goal: '',
    targetAmount: '',
    targetDate: '',
    planType: ''
  });
  const [analysis, setAnalysis] = useState(null);
  const [feasibility, setFeasibility] = useState(null);

  useEffect(() => {
    const analysis = analyzeFinances(openApiData, incomeData);
    setAnalysis(analysis);
  }, [openApiData, incomeData]);

  const calculateFeasibility = () => {
    if (!analysis || !financialData.targetAmount || !financialData.targetDate) return null;

    const targetDate = new Date(financialData.targetDate);
    const today = new Date();
    const daysToGoal = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    const monthlyDisposableIncome = analysis.disposableIncome;
    const dailyDisposableIncome = monthlyDisposableIncome / 30;
    
    const requiredDailySavings = financialData.targetAmount / daysToGoal;
    
    // Calculate flexible range (±20% of required daily savings)
    const flexibleMin = requiredDailySavings * 0.8;
    const flexibleMax = requiredDailySavings * 1.2;
    const flexiDaysMin = financialData.targetAmount / flexibleMax;
    const flexiDaysMax = financialData.targetAmount / flexibleMin;

    return {
      isAchievable: requiredDailySavings <= dailyDisposableIncome,
      strictPlan: {
        dailySavings: requiredDailySavings,
        daysToGoal: daysToGoal
      },
      flexiPlan: {
        minDailySavings: flexibleMin,
        maxDailySavings: flexibleMax,
        minDays: Math.ceil(flexiDaysMin),
        maxDays: Math.ceil(flexiDaysMax)
      }
    };
  };

  const handleNext = () => {
    if (step === 2) {
      const feasibilityResult = calculateFeasibility();
      setFeasibility(feasibilityResult);
    }
    setStep(step + 1);
  };

  const handleSavePlan = async () => {
    const planData = {
      username,
      goal: financialData.goal,
      targetAmount: parseFloat(financialData.targetAmount),
      targetDate: financialData.targetDate,
      planType: financialData.planType,
      dailySavings: financialData.planType === 'strict' 
        ? feasibility.strictPlan.dailySavings
        : {
            min: feasibility.flexiPlan.minDailySavings,
            max: feasibility.flexiPlan.maxDailySavings
          },
      daysToGoal: financialData.planType === 'strict'
        ? feasibility.strictPlan.daysToGoal
        : {
            min: feasibility.flexiPlan.minDays,
            max: feasibility.flexiPlan.maxDays
          }
    };

    try {
      const response = await fetch('/api/saveDailyPlan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      if (response.ok) {
        onClose();
      } else {
        alert('Failed to save plan');
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Error saving plan');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">What's Your Savings Goal?</h2>
            <input
              type="text"
              placeholder="e.g., New Car, Holiday, Emergency Fund"
              className="w-full p-2 border rounded"
              value={financialData.goal}
              onChange={(e) => setFinancialData({...financialData, goal: e.target.value})}
            />
            <button
              onClick={handleNext}
              disabled={!financialData.goal}
              className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Set Your Target</h2>
            <div>
              <label className="block text-sm font-medium">Target Amount (RM)</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={financialData.targetAmount}
                onChange={(e) => setFinancialData({...financialData, targetAmount: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Target Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                min={new Date().toISOString().split('T')[0]}
                value={financialData.targetDate}
                onChange={(e) => setFinancialData({...financialData, targetDate: e.target.value})}
              />
            </div>
            <button
              onClick={handleNext}
              disabled={!financialData.targetAmount || !financialData.targetDate}
              className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-300"
            >
              Calculate Plan
            </button>
          </div>
        )}

        {step === 3 && feasibility && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Choose Your Savings Plan</h2>
            
            {!feasibility.isAchievable && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                Warning: This goal might be challenging with your current disposable income.
                Consider extending your target date or adjusting the target amount.
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Flexible Plan */}
              <div 
                className={`p-4 border rounded cursor-pointer ${
                  financialData.planType === 'flexi' ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setFinancialData({...financialData, planType: 'flexi'})}
              >
                <h3 className="font-bold mb-2">Flexible Plan</h3>
                <ul className="space-y-2 text-sm">
                  <li>Daily Savings: RM {feasibility.flexiPlan.minDailySavings.toFixed(2)} - {feasibility.flexiPlan.maxDailySavings.toFixed(2)}</li>
                  <li>Timeline: {feasibility.flexiPlan.minDays} - {feasibility.flexiPlan.maxDays} days</li>
                  <li>Adjustable daily savings</li>
                  <li>More flexibility</li>
                </ul>
              </div>

              {/* Strict Plan */}
              <div 
                className={`p-4 border rounded cursor-pointer ${
                  financialData.planType === 'strict' ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setFinancialData({...financialData, planType: 'strict'})}
              >
                <h3 className="font-bold mb-2">Strict Plan</h3>
                <ul className="space-y-2 text-sm">
                  <li>Daily Savings: RM {feasibility.strictPlan.dailySavings.toFixed(2)}</li>
                  <li>Timeline: {feasibility.strictPlan.daysToGoal} days</li>
                  <li>Fixed daily savings</li>
                  <li>Consistent routine</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 p-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlan}
                disabled={!financialData.planType}
                className="flex-1 bg-blue-500 text-white p-2 rounded disabled:bg-gray-300"
              >
                Save Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}