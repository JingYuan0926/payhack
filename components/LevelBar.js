import { useState, useEffect } from "react";
import FinancialPlanPopup from "./FinancialPlanPopup";
import SpendHistory from "./spendHistory";
import { useRouter } from 'next/router';

export default function LevelBar({ 
  username = "Username", 
  progress = 60, 
  dangerProgress = 90, 
  onFeedCat 
}) {
  const router = useRouter();
  const [currentProgress, setCurrentProgress] = useState(progress);
  const [showFinancialPlan, setShowFinancialPlan] = useState(false);
  const [showSpendHistory, setShowSpendHistory] = useState(false);
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

  return (
    <div className="p-4 flex justify-between items-start">
      <div className="w-[30%] ml-8">
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
        
        {/* Experience bar (green) */}
        <div className="w-full h-6 border-4 border-black [image-rendering:pixelated] bg-gray-200 mb-2">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${currentProgress}%` }}
          ></div>
        </div>

        {/* Love Level bar (red) with label */}
        <div className="mb-1">
          <span className="text-sm font-semibold text-red-500">
            Love Level
          </span>
        </div>
        <div className="w-full h-6 border-4 border-black [image-rendering:pixelated] bg-gray-200">
          <div
            className="h-full bg-red-500"
            style={{ width: `${dangerProgress}%` }}
          ></div>
        </div>
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
    </div>
  );
}