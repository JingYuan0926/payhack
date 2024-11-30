import { useState, useEffect } from "react";
import FinancialPlanPopup from "./FinancialPlanPopup";
import SpendHistory from "./spendHistory";
import DailySum from "./DailySum";
import { useRouter } from 'next/router';

export default function LevelBar({ 
  username = "Username", 
  progress = 60, 
  dangerProgress = 90, 
  level = 1,
  streak = 0
}) {
  const router = useRouter();
  const [currentProgress, setCurrentProgress] = useState(progress);
  const [showFinancialPlan, setShowFinancialPlan] = useState(false);
  const [showSpendHistory, setShowSpendHistory] = useState(false);
  const [showDailySum, setShowDailySum] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setCurrentProgress(progress);
  }, [progress]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup timer on component unmount
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  // Example spending history
  const spendingHistory = [
    { description: "Buy food", amount: 20 },
    { description: "Buy food", amount: 100 },
    { description: "Buy furniture", amount: 20 },
  ];

  const handleProgressClick = () => {
    router.push('/Progress');
  };

  return (
    <div className="p-4 flex justify-between items-start">
      <div className="w-[50%] ml-8">
        <div className="text-lg font-bold mb-2 flex items-center">
          <span 
            className="pixel-text-blue text-3xl cursor-pointer hover:text-blue-600"
            onClick={() => router.push('/dashboard')}
          >
            {username}
          </span>
          <button
            onClick={() => setShowFinancialPlan(true)}
            className="ml-2 px-2 py-0.5 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none"
          >
            +
          </button>
        </div>
        
        {/* Health bar (green) with stats beside it */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full h-8 border-4 border-black [image-rendering:pixelated] bg-gray-200">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${currentProgress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Level and Streak display */}
          <div className="flex gap-6 text-2xl">
            <div className="flex items-center">
              <span className="font-bold pixel-text-golden text-4xl">LVL {level}</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold text-4xl">
                <span>🔥 </span>
                <span className="pixel-text-golden">{streak}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress and Daily Sum Buttons Container */}
      <div className="flex flex-col space-y-2 mt-4">
        {/* Progress Button */}
        <button
          onClick={handleProgressClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                   shadow-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
          <span>Progress</span>
        </button>

        {/* Daily Summarization Button */}
        <button
          onClick={() => setShowDailySum(true)}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg 
                   shadow-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <img
            src="/summary.png"
            alt="Daily Summary"
            className="w-5 h-5"
          />
          <span>Daily Summary</span>
        </button>
      </div>

      {/* Date and Time Area */}
      <div
        className="pixel-text-blue text-3xl mr-8 text-right cursor-pointer hover:text-blue-600"
        onClick={() => setShowSpendHistory(true)}
      >
        <div>{formattedDate}</div>
        <div>{formattedTime}</div>
      </div>

      {/* Popups */}
      {showSpendHistory && (
        <SpendHistory
          onClose={() => setShowSpendHistory(false)}
          history={spendingHistory}
        />
      )}

      {showFinancialPlan && (
        <FinancialPlanPopup
          onClose={() => setShowFinancialPlan(false)}
          username={username}
        />
      )}

      {/* Add DailySum component if you want to keep the popup functionality */}
      {showDailySum && (
        <DailySum
          showPopup={showDailySum}
          onClose={() => setShowDailySum(false)}
        />
      )}
    </div>
  );
}