import { useState, useEffect } from 'react';
import { analyzeFinances } from '../pages/api/financial-analysis';
import { getFurniture, saveFurniture } from '../utils/furnitureStorage';

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
    
    // Get monthly disposable income and convert to daily
    const monthlyDisposableIncome = analysis.disposableIncome || 0; // RM 2409.50
    const dailyDisposableIncome = monthlyDisposableIncome / 30; // About RM 80.32 per day
    
    // Calculate required daily savings
    const requiredDailySavings = parseFloat(financialData.targetAmount) / daysToGoal;
    
    // Calculate flexible range (±20% of required daily savings)
    const flexibleMin = requiredDailySavings * 0.8;
    const flexibleMax = requiredDailySavings * 1.2;
    const flexiDaysMin = parseFloat(financialData.targetAmount) / flexibleMax;
    const flexiDaysMax = parseFloat(financialData.targetAmount) / flexibleMin;

    // A goal is considered achievable if the required daily savings is less than daily disposable income
    const remainingDaily = dailyDisposableIncome - requiredDailySavings;

    console.log({
      monthlyDisposableIncome,
      dailyDisposableIncome,
      requiredDailySavings,
      remainingDaily
    });

    return {
      isAchievable: requiredDailySavings <= dailyDisposableIncome,
      monthlyDisposableIncome,
      dailyDisposableIncome,
      requiredDailySavings,
      remainingDaily,
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
    // Use the same values from feasibility check instead of recalculating
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
          },
      // Use the values directly from feasibility check
      dailyLimit: feasibility.dailyDisposableIncome,
      monthlyDebt: feasibility.monthlyDisposableIncome * 0.2, // Keep 20% for monthly debt
      dailyDisposableIncome: feasibility.dailyDisposableIncome,
      monthlyDisposableIncome: feasibility.monthlyDisposableIncome,
      remainingDaily: financialData.planType === 'strict'
        ? feasibility.remainingDaily
        : {
            min: feasibility.dailyDisposableIncome - feasibility.flexiPlan.maxDailySavings,
            max: feasibility.dailyDisposableIncome - feasibility.flexiPlan.minDailySavings
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
        const mapElement = document.getElementById('game-map');
        const mapRect = mapElement.getBoundingClientRect();
        
        // Get existing furniture and filter out any previous celebration/background pieces
        const existingFurniture = (await getFurniture() || [])
          .filter(item => !item.isCelebration && !item.isBackground);
        
        // Background furniture (without celebration properties)
        const backgroundFurniture = {
          id: `background-${Date.now()}`,
          src: '/house.png',
          position: {
            x: 100,
            y: 100
          },
          name: 'Background House',
          originalWidth: 100,
          originalHeight: 100,
          placedWidth: 250,
          placedHeight: 250,
          isBackground: true
        };

        // Celebration furniture (with progress bar)
        const celebrationFurniture = {
          id: `celebration-${Date.now()}`,
          src: '/gray_house.png',
          position: {
            x: 100,
            y: 100
          },
          name: 'New House Goal!',
          originalWidth: 100,
          originalHeight: 100,
          placedWidth: 250,
          placedHeight: 250,
          progress: 0,
          isCelebration: true
        };

        // Add only the new pieces
        await saveFurniture([...existingFurniture, backgroundFurniture, celebrationFurniture]);

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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-4xl font-bold pixel-text-blue">
            Financial Plans
          </h3>
          
        </div>

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
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={onClose}
                className="text-xl px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={!financialData.goal}
                className="text-xl px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:hover:bg-gray-300"
              >
                Next
              </button>
            </div>
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
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={onClose}
                className="text-xl px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={!financialData.targetAmount || !financialData.targetDate}
                className="text-xl px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:hover:bg-gray-300"
              >
                Calculate Plan
              </button>
            </div>
          </div>
        )}

        {step === 3 && feasibility && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Choose Your Savings Plan</h2>
            
            {!feasibility.isAchievable ? (
              <>
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                  <p>Warning: This goal might be challenging with your current finances.</p>
                  <ul className="list-disc ml-4 mt-2">
                    <li>Monthly disposable income: RM {feasibility.monthlyDisposableIncome.toFixed(2)}</li>
                    <li>Daily disposable income: RM {feasibility.dailyDisposableIncome.toFixed(2)}</li>
                    <li>Required daily savings: RM {feasibility.requiredDailySavings.toFixed(2)}</li>
                    <li>Consider extending your target date or adjusting the target amount</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={onClose}
                    className="text-xl px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setStep(1);
                      setFinancialData({
                        goal: '',
                        targetAmount: '',
                        targetDate: '',
                        planType: ''
                      });
                    }}
                    className="text-xl px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Edit Plan
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                  <p>✅ Your goal is achievable!</p>
                  <ul className="list-disc ml-4 mt-2">
                    <li>Monthly disposable income: RM {feasibility.monthlyDisposableIncome.toFixed(2)}</li>
                    <li>Daily disposable income: RM {feasibility.dailyDisposableIncome.toFixed(2)}</li>
                    <li>Required daily savings: RM {feasibility.requiredDailySavings.toFixed(2)}</li>
                    <li>Remaining daily after savings: RM {feasibility.remainingDaily.toFixed(2)}</li>
                  </ul>
                </div>

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

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={onClose}
                    className="text-xl px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePlan}
                    disabled={!financialData.planType}
                    className="text-xl px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:hover:bg-gray-300"
                  >
                    Save Plan
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}