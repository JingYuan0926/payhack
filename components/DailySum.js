import React, { useState } from 'react';
import styles from '../styles/DailySum.module.css';
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
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div 
        className="absolute inset-0 bg-gray-900 bg-opacity-75"
        onClick={onClose}
      />
      
      {/* Spin Wheel Popup */}
      {showSpinWheel && (
        <div className="relative z-[10000] w-[800px] mx-auto flex items-center justify-center">
          <div className="relative bg-white border-8 border-black [image-rendering:pixelated] 
                          shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            {/* Single Layer of Pixel Corner Decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 bg-black"></div>
            <div className="absolute top-0 right-0 w-4 h-4 bg-black"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 bg-black"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-black"></div>
            
            <SpinWheel onRewardClaimed={handleSpinWheelClose} />
          </div>
        </div>
      )}

      {/* Pixel Card Container */}
      {!showSpinWheel && (
        <div 
          className={`relative ${styles.perspective1000} w-[800px] h-[600px] cursor-pointer`}
          onClick={handleCardClick}
        >
          {/* Card Inner */}
          <div className={`relative w-full h-full transition-transform duration-500 ${styles.transformStyle3d} 
                          ${isFlipped ? styles.rotateY180 : ''}`}>
            
            {/* Front Side */}
            <div className={`absolute w-full h-full ${styles.backfaceHidden}
                            bg-white border-8 border-black [image-rendering:pixelated]
                            shadow-[8px_8px_0_0_rgba(0,0,0,1)]
                            ${isFlipped ? 'invisible' : ''}`}>
              {/* Pixel Corner Decorations */}
              <div className="absolute top-0 left-0 w-4 h-4 bg-black"></div>
              <div className="absolute top-0 right-0 w-4 h-4 bg-black"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-black"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-black"></div>
              
              {/* Content */}
              <div className="p-12">
                <h2 className="text-4xl font-bold mb-8 pixel-text-blue">Daily Summary</h2>
                
                <div className="space-y-6">
                  {/* Today's Spending */}
                  <div className="p-4 bg-blue-50 rounded-lg border-4 border-blue-200">
                    <h3 className="text-xl font-bold mb-3 text-blue-600">Today&apos;s Spending</h3>
                    <div className="space-y-2">
                      <p className="text-lg">Total spent: <span className="font-bold">${"350"}</span></p>
                      <div className="flex justify-between">
                        <span>🍔 Food: $150</span>
                        <span>🚗 Transport: $50</span>
                        <span>🛒 Shopping: $150</span>
                      </div>
                    </div>
                  </div>

                  {/* Budget Status */}
                  <div className="p-4 bg-green-50 rounded-lg border-4 border-green-200">
                    <h3 className="text-xl font-bold mb-3 text-green-600">Budget Status</h3>
                    <div className="space-y-2">
                      <p className="text-lg">Remaining budget: <span className="font-bold">$650</span></p>
                      <p className="text-green-600 font-bold">Status: On track! 🎯</p>
                    </div>
                  </div>
                </div>

                <p className="text-center mt-6 text-gray-500">Click to see recommendations →</p>
              </div>
            </div>

            {/* Back Side */}
            <div className={`absolute w-full h-full ${styles.backfaceHidden} ${styles.rotateY180}
                            bg-white border-8 border-black [image-rendering:pixelated]
                            shadow-[8px_8px_0_0_rgba(0,0,0,1)]
                            ${!isFlipped ? 'invisible' : ''}`}>
              {/* Pixel Corner Decorations */}
              <div className="absolute top-0 left-0 w-4 h-4 bg-black"></div>
              <div className="absolute top-0 right-0 w-4 h-4 bg-black"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-black"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-black"></div>

              {/* Content */}
              <div className="p-12">
                <h2 className="text-4xl font-bold mb-8 pixel-text-blue">Recommendations</h2>
                
                <div className="p-6 bg-yellow-50 rounded-lg border-4 border-yellow-200">
                  <ul className="space-y-4">
                    <li className="flex items-start space-x-3">
                      <span className="text-2xl">💡</span>
                      <span>Consider reducing spending on coffee - try making it at home!</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-2xl">🌟</span>
                      <span>Great job staying within your grocery budget this week!</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-2xl">📝</span>
                      <span>Remember to log all your expenses for better tracking</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-2xl">💰</span>
                      <span>You&apos;re on track to meet your savings goal this month!</span>
                    </li>
                  </ul>
                </div>

                <p className="text-center mt-6 text-gray-500">Click to spin the wheel! 🎡</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailySum; 