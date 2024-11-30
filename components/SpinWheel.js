import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PREVIEW_SCALE, PLACED_SCALE } from '../pages/furniture';

const RARITY_CONFIG = {
  common: {
    color: '#808080', // grey
    probability: 0.50, // 50%
    items: [1, 2, 3, 8, 9, 12, 17] // furniture IDs for common items
  },
  uncommon: {
    color: '#2ecc71', // green
    probability: 0.25, // 25%
    items: [4, 11, 13] // furniture IDs for uncommon items
  },
  rare: {
    color: '#3498db', // blue
    probability: 0.15, // 15%
    items: [5, 7, 10, 16] // furniture IDs for rare items
  },
  epic: {
    color: '#9b59b6', // purple
    probability: 0.07, // 7%
    items: [6, 15] // furniture IDs for epic items
  },
  legendary: {
    color: '#f1c40f', // gold
    probability: 0.03, // 3%
    items: [14] // furniture IDs for legendary items
  }
};

const FURNITURE_DATA = {
  1: { name: 'Double Sofa', src: '/furniture/doubleSofa.png' },
  2: { name: 'Left Sofa', src: '/furniture/leftSofa.png' },
  3: { name: 'Right Sofa', src: '/furniture/rightSofa.png' },
  4: { name: 'Table', src: '/furniture/table.png' },
  5: { name: 'Bookshelf', src: '/furniture/bookShelf.png' },
  6: { name: 'Double Bed', src: '/furniture/doubleBed.png' },
  7: { name: 'Single Bed', src: '/furniture/singleBed.png' },
  8: { name: 'Wooden Chair', src: '/furniture/woodenChair.png' },
  9: { name: 'Small Chair', src: '/furniture/smallChair.png' },
  10: { name: 'Big Bonsai', src: '/furniture/bigBonsai.png' },
  11: { name: 'Small Bonsai', src: '/furniture/smallBonsai.png' },
  12: { name: 'Flower Pot', src: '/furniture/flowerPot.png' },
  13: { name: 'Small Cabinet', src: '/furniture/smallCabinet.png' },
  14: { name: 'Big Mattress', src: '/furniture/bigMattress.png' },
  15: { name: 'Small Mattress', src: '/furniture/smallMattress.png' },
  16: { name: 'Window', src: '/furniture/window.png' },
  17: { name: 'Curtain', src: '/furniture/curtain.png' }
};

const SpinWheel = ({ onRewardClaimed }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [reward, setReward] = useState(null);
  const [showReward, setShowReward] = useState(false);

  const determineRarity = () => {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [rarity, config] of Object.entries(RARITY_CONFIG)) {
      cumulative += config.probability;
      if (rand <= cumulative) {
        return rarity;
      }
    }
    return 'common'; // fallback
  };

  const getRandomFurniture = (rarity) => {
    const possibleItems = RARITY_CONFIG[rarity].items;
    const randomIndex = Math.floor(Math.random() * possibleItems.length);
    const furnitureId = possibleItems[randomIndex];
    return { id: furnitureId, ...FURNITURE_DATA[furnitureId], rarity };
  };

  const triggerRewardAnimation = (rarity) => {
    // Enhanced confetti effects
    const defaults = {
      spread: 360,
      ticks: 200,
      gravity: 0.5,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['star'],
      colors: [RARITY_CONFIG[rarity].color, 'white', '#gold']
    };

    // Multiple confetti bursts for more sparkle
    confetti({
      ...defaults,
      particleCount: 100,
      scalar: 1.2,
      shapes: ['star']
    });

    confetti({
      ...defaults,
      particleCount: 50,
      scalar: 0.75,
      shapes: ['circle']
    });

    // Additional burst after slight delay
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 50,
        scalar: 1,
        shapes: ['star']
      });
    }, 200);
  };

  // Helper function to get rarity based on final rotation
  const getRarityFromRotation = (finalRotation) => {
    // Normalize the rotation to 0-360 range
    const normalizedRotation = ((finalRotation % 360 + 360) % 360);
    // Each segment is 72 degrees (360/5)
    const segmentAngle = 360 / Object.keys(RARITY_CONFIG).length;
    // Calculate which segment the pointer is pointing to
    const segmentIndex = Math.floor(normalizedRotation / segmentAngle);
    // Get the rarity at this index (reversed because pointer is at top)
    return Object.keys(RARITY_CONFIG)[4 - segmentIndex];
  };

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowReward(false);
    
    // Calculate final rotation (always spinning right/clockwise)
    const currentRotation = rotation % 360;
    const spins = 10; // number of full spins
    const baseRotation = rotation + (spins * 360);
    const randomOffset = Math.random() * 360;
    const finalRotation = baseRotation + randomOffset;
    
    // Set the rotation first
    setRotation(finalRotation);
    
    // After rotation completes, determine the reward based on where it stopped
    setTimeout(() => {
      const rarity = getRarityFromRotation(finalRotation);
      const furniture = getRandomFurniture(rarity);
      
      setIsSpinning(false);
      setReward(furniture);
      setShowReward(true);
      triggerRewardAnimation(rarity);
    }, 3000);
  };

  const claimReward = () => {
    if (reward && onRewardClaimed) {
      // Create new image to get dimensions
      const img = new Image();
      img.src = reward.src;
      
      img.onload = () => {
        const rewardWithId = {
          ...reward,
          id: `${reward.id}-${Date.now()}`,
          price: reward.rarity.toUpperCase(),
          // Add original dimensions
          originalWidth: img.width,
          originalHeight: img.height,
          // Add preview dimensions
          previewWidth: img.width * PREVIEW_SCALE,
          previewHeight: img.height * PREVIEW_SCALE,
          // Add placed dimensions
          placedWidth: img.width * PLACED_SCALE,
          placedHeight: img.height * PLACED_SCALE
        };
        
        const currentInventory = JSON.parse(localStorage.getItem('furnitureInventory') || '[]');
        const updatedInventory = [...currentInventory, rewardWithId];
        localStorage.setItem('furnitureInventory', JSON.stringify(updatedInventory));
        
        onRewardClaimed(rewardWithId);
        setShowReward(false);
        setReward(null);
      };
    }
  };

  return (
    <div className="relative w-full max-w-[800px] h-auto min-h-[400px] px-4 mx-auto">
      {/* Content Container */}
      <div className="p-4 sm:p-8 md:p-12 flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-8 pixel-text-blue">
          Spin to Win!
        </h2>
        
        {/* Spin Wheel Container */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 mb-4 sm:mb-8">
          {/* Main Wheel */}
          <div
            className="absolute w-full h-full rounded-full overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning 
                ? 'transform 3s cubic-bezier(0.2, 0.8, 0.2, 0.99)'
                : 'none',
              boxShadow: `
                0 0 0 4px white,
                0 0 0 5px #e0e0e0,
                0 0 20px rgba(0,0,0,0.5)
              `,
              background: '#2a2a2a',
            }}
          >
            {/* Wheel segments */}
            {Object.entries(RARITY_CONFIG).map(([rarity, config], index) => {
              const segmentAngle = 360 / Object.keys(RARITY_CONFIG).length;
              return (
                <div
                  key={rarity}
                  className="absolute w-full h-full"
                  style={{
                    transform: `rotate(${index * segmentAngle}deg)`,
                    transformOrigin: '50% 50%',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      background: config.color,
                      clipPath: `polygon(50% 50%, 50% 0, ${50 + Math.tan((Math.PI / 180) * segmentAngle) * 50}% 0, 50% 50%)`,
                      boxShadow: 'inset 0 0 15px rgba(0,0,0,0.2)',
                    }}
                  />
                  {/* Rarity Label */}
                  {/* <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '25%',
                      transform: `
                        rotate(${segmentAngle / 2}deg) 
                        translateX(-50%)
                      `,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {rarity.toUpperCase()}
                  </div> */}
                </div>
              );
            })}
          </div>

          {/* Center Spin Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20
                       w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white border-2 sm:border-4 border-gray-300
                       flex items-center justify-center
                       transition-all duration-200 hover:scale-105"
            style={{
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            }}
          >
            <div className="text-gray-800 font-bold text-base sm:text-lg md:text-xl">
              {isSpinning ? '...' : 'SPIN'}
            </div>
            {/* Pointer Line */}
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full h-6 sm:h-8 w-1 sm:w-2"
              style={{
                background: 'white',
                boxShadow: '0 0 5px rgba(0,0,0,0.3)',
              }}
            />
          </button>
        </div>

        {/* Reward Popup - Modified to match style */}
        {showReward && reward && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className={`bg-white p-4 sm:p-6 md:p-8 border-4 sm:border-8 border-black [image-rendering:pixelated]
                            shadow-[4px_4px_0_0_rgba(0,0,0,1)] sm:shadow-[8px_8px_0_0_rgba(0,0,0,1)] 
                            rounded-lg transform animate-reward-popup
                            max-w-[90vw] sm:max-w-[400px]`}>
              {/* Pixel Corner Decorations */}
              <div className="absolute top-0 left-0 w-4 h-4 bg-black"></div>
              <div className="absolute top-0 right-0 w-4 h-4 bg-black"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-black"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-black"></div>

              <h2 
                className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4 text-center"
                style={{ color: RARITY_CONFIG[reward.rarity].color }}
              >
                {reward.rarity.toUpperCase()}!
              </h2>
              <div className="relative">
                <img
                  src={reward.src}
                  alt={reward.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain mx-auto"
                />
                <div className="absolute inset-0 animate-sparkle-1" />
                <div className="absolute inset-0 animate-sparkle-2" />
                <div className="absolute inset-0 animate-sparkle-3" />
              </div>
              <p className="text-lg sm:text-xl md:text-2xl mt-2 sm:mt-4 text-center font-bold">
                {reward.name}
              </p>
              <button
                onClick={claimReward}
                className="mt-4 sm:mt-6 w-full px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 
                         text-white rounded-lg font-bold text-base sm:text-lg transform transition-all
                         hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:ring-opacity-50"
              >
                Claim Reward
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to adjust color brightness
const adjustColor = (color, amount) => {
  return '#' + color.replace(/^#/, '').replace(/../g, color => 
    ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
  );
};

export default SpinWheel;
