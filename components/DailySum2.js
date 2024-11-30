import React, { useState } from 'react';
import SpinWheel from './SpinWheel';
import DailyGoals from './DailyGoals';

const DailySum2 = ({ showPopup, onClose, onStreakUpdate }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showDailyGoals, setShowDailyGoals] = useState(false);

  if (!showPopup) return null;

  const handleCardClick = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleViewAdjustedGoals = async () => {
    try {
      const response = await fetch('/api/updateDailyPlan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          overspentAmount: 1000,
          username: "Tom The Cat"
        }),
      });

      if (response.ok) {
        onClose();
        setTimeout(() => {
          setShowDailyGoals(true);
        }, 100);
      }
    } catch (error) {
      console.error('Error updating goals:', error);
    }
  };

  const handleDailyGoalsClose = () => {
    setShowDailyGoals(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001]">
        {/* Card Container */}
        {!showDailyGoals && (
          <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-[500px]">
            {/* Front Side - Daily Summary */}
            {!isFlipped && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-4xl font-bold pixel-text-red">Daily Summary</h2>
                </div>

                <div className="space-y-4 overflow-y-auto">
                  {/* Today's Spending */}
                  <div className="bg-red-50 p-3 rounded-lg">
                    <h3 className="text-xl font-bold mb-3 text-red-600">Today's Spending</h3>
                    <p className="text-5xl font-bold text-red-600">RM 1,150</p>
                    <div className="mt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xl text-gray-600">
                        <div className="flex items-center">
                          <span>🍔 Food:</span>
                          <span className="ml-1">RM 250</span>
                        </div>
                        <div className="flex items-center">
                          <span>🚗 Transport:</span>
                          <span className="ml-1">RM 300</span>
                        </div>
                        <div className="flex items-center">
                          <span>🛒 Shopping:</span>
                          <span className="ml-1">RM 600</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Budget Status */}
                  <div className="bg-red-50 p-3 rounded-lg">
                    <h3 className="text-xl font-bold mb-3 text-red-600">Budget Status</h3>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <p className="text-xl text-gray-600">
                          Over budget by: <span className="font-bold text-red-600">RM 1,036.35</span>
                        </p>
                        <p className="text-xl text-red-600 font-bold">
                          Status: Overbudget! ⚠️
                        </p>
                      </div>
                    </div>
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
                    onClick={handleCardClick}
                    className="text-xl px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Back Side - Recommendations */}
            {isFlipped && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-4xl font-bold pixel-text-red">Emergency Recommendations</h2>
                </div>

                <div className="space-y-4 overflow-y-auto">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <ul className="space-y-4">
                      <li className="flex items-start space-x-3">
                        <span className="text-2xl">⚠️</span>
                        <span className="text-xl text-gray-600">You've significantly exceeded your daily budget. Your savings goals need adjustment.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-2xl">📊</span>
                        <span className="text-xl text-gray-600">Consider implementing a strict 50/30/20 budgeting rule for the next month.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-2xl">🎯</span>
                        <span className="text-xl text-gray-600">Let's revise your daily spending limit and timeline to accommodate today's overspending.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-2xl">💡</span>
                        <span className="text-xl text-gray-600">Try using cash instead of cards to better control spending.</span>
                      </li>
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
                    onClick={handleViewAdjustedGoals}
                    className="text-xl px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    View Adjusted Budget Goals
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Render DailyGoals as a separate overlay */}
      {showDailyGoals && (
        <DailyGoals 
          showPopup={showDailyGoals} 
          onClose={handleDailyGoalsClose}
        />
      )}
    </>
  );
};

export default DailySum2; 