import React, { useState } from 'react';
import SpinWheel from './SpinWheel';

const DailySum = ({ showPopup, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);

  if (!showPopup) return null;

  const handleCardClick = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    } else if (!showSpinWheel) {
      setShowSpinWheel(true);
    }
  };

  const handleSpinWheelClose = () => {
    setShowSpinWheel(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001]">
      {/* Spin Wheel Popup */}
      {showSpinWheel && (
        <div className="relative z-[10000] w-[800px] mx-auto flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl">
            <SpinWheel onRewardClaimed={handleSpinWheelClose} />
          </div>
        </div>
      )}

      {/* Card Container */}
      {!showSpinWheel && (
        <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-[500px]">
          {/* Front Side - Daily Summary */}
          {!isFlipped && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-4xl font-bold pixel-text-blue">Daily Summary</h2>
              </div>

              <div className="space-y-4 overflow-y-auto">
                {/* Today's Spending */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="text-xl font-bold mb-3 text-blue-600">Today's Spending</h3>
                  <p className="text-5xl font-bold text-blue-600">RM 350</p>
                  <div className="mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xl text-gray-600">
                      <div className="flex items-center">
                        <span>🍔 Food:</span>
                        <span className="ml-1">RM 150</span>
                      </div>
                      <div className="flex items-center">
                        <span>🚗 Transport:</span>
                        <span className="ml-1">RM 50</span>
                      </div>
                      <div className="flex items-center">
                        <span>🛒 Shopping:</span>
                        <span className="ml-1">RM 150</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Status */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <h3 className="text-xl font-bold mb-3 text-green-600">Budget Status</h3>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <p className="text-xl text-gray-600">
                        Remaining budget: <span className="font-bold">RM 650</span>
                      </p>
                      <p className="text-xl text-green-600 font-bold">
                        Status: On track! 🎯
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
                  className="text-xl px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
                <h2 className="text-4xl font-bold pixel-text-blue">Recommendations</h2>
              </div>

              <div className="space-y-4 overflow-y-auto">
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <ul className="space-y-4">
                    <li className="flex items-start space-x-3">
                      <span className="text-2xl">💡</span>
                      <span className="text-xl text-gray-600">Consider reducing spending on coffee - try making it at home!</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-2xl">🌟</span>
                      <span className="text-xl text-gray-600">Great job staying within your grocery budget this week!</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-2xl">📝</span>
                      <span className="text-xl text-gray-600">Remember to log all your expenses for better tracking</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-2xl">💰</span>
                      <span className="text-xl text-gray-600">You're on track to meet your savings goal this month!</span>
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
                  onClick={handleCardClick}
                  className="text-xl px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Spin & Win
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailySum;