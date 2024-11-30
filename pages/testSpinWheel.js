import React from 'react';
import SpinWheel from '../components/SpinWheel';

const TestSpinWheel = () => {
  const handleRewardClaimed = (reward) => {
    // For testing purposes, we'll just log the reward to console
    console.log('Claimed reward:', reward);
    
    // You can add more handling here, such as:
    // - Saving to local storage
    // - Updating user's inventory in database
    // - Showing a success message
    alert(`You got a ${reward.rarity} ${reward.name}!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Test Spin Wheel
        </h1>
        
        <SpinWheel onRewardClaimed={handleRewardClaimed} />
      </div>
    </div>
  );
};

export default TestSpinWheel;