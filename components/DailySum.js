import React, { useState } from 'react';
import styles from '../styles/DailySum.module.css';

const DailySum = ({ showPopup, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Add current date formatting
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div 
        className="absolute inset-0 bg-gray-900 bg-opacity-75"
        onClick={onClose}
      />
      
      {/* Pixel Card Container */}
      <div 
        className={`relative ${styles.perspective1000} w-[800px] h-[600px] cursor-pointer`}
        onClick={() => {
          if (isFlipped) {
            onClose();
          } else {
            setIsFlipped(true);
          }
        }}
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
              <h2 className="text-5xl font-bold mb-4 pixel-text-blue">Daily Summary</h2>
              <p className="text-2xl mb-6 text-gray-600">{currentDate}</p>
              
              <div className="space-y-8">
                {/* Today's Spending */}
                <div className="p-6 bg-blue-50 rounded-lg border-4 border-blue-200">
                  <h3 className="text-2xl font-bold mb-4 text-blue-600">Today's Spending</h3>
                  <div className="space-y-3">
                    <p className="text-2xl">Total spent: <span className="font-bold">$350</span></p>
                    <div className="flex justify-between text-xl">
                      <span>🍔 Food: $150</span>
                      <span>🚗 Transport: $50</span>
                      <span>🛒 Shopping: $150</span>
                    </div>
                  </div>
                </div>

                {/* Budget Status */}
                <div className="p-6 bg-green-50 rounded-lg border-4 border-green-200">
                  <h3 className="text-2xl font-bold mb-4 text-green-600">Budget Status</h3>
                  <div className="space-y-3">
                    <p className="text-2xl">Remaining budget: <span className="font-bold">$650</span></p>
                    <p className="text-green-600 font-bold text-xl">Status: On track! 🎯</p>
                  </div>
                </div>
              </div>

              <p className="text-center mt-8 text-gray-500 text-xl">Click to see recommendations →</p>
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
              <h2 className="text-5xl font-bold mb-8 pixel-text-blue">Recommendations</h2>
              
              <div className="p-8 bg-yellow-50 rounded-lg border-4 border-yellow-200">
                <ul className="space-y-6">
                  <li className="flex items-start space-x-4">
                    <span className="text-3xl">💡</span>
                    <span className="text-xl">Consider reducing spending on coffee - try making it at home!</span>
                  </li>
                  <li className="flex items-start space-x-4">
                    <span className="text-3xl">🌟</span>
                    <span className="text-xl">Great job staying within your grocery budget this week!</span>
                  </li>
                  <li className="flex items-start space-x-4">
                    <span className="text-3xl">📝</span>
                    <span className="text-xl">Remember to log all your expenses for better tracking</span>
                  </li>
                  <li className="flex items-start space-x-4">
                    <span className="text-3xl">💰</span>
                    <span className="text-xl">You're on track to meet your savings goal this month!</span>
                  </li>
                </ul>
              </div>

              <p className="text-center mt-8 text-gray-500 text-xl">Click to close ×</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySum; 