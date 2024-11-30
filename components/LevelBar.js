import { useState, useEffect } from "react";
import FinancialPlanPopup from "./FinancialPlanPopup";
import SpendHistory from "./spendHistory";
import DailySum from "./DailySum";
import { useRouter } from 'next/router';
import ProgressButton from './ProgressButton';
import DailySummaryButton from './DailySummaryButton';

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
  const [openApiData, setOpenApiData] = useState(null);
  const [incomeData, setIncomeData] = useState(null);

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

  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        const openApiData = await import('../data/openapi.json')
          .then(module => module.default);
        const incomeData = await import('../data/income.json')
          .then(module => module.default);

        setOpenApiData(openApiData);
        setIncomeData(incomeData);
      } catch (error) {
        console.error('Error loading financial data:', error);
      }
    };

    loadFinancialData();
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
    router.push('/progress');
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Top row with all elements aligned */}
      <div className="flex justify-between items-center">
        {/* Left side: Username */}
        <div className="flex items-center">
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

        {/* Right side: Date and Time */}
        <div
          className="pixel-text-blue text-3xl cursor-pointer hover:text-blue-600 text-right"
          onClick={() => setShowSpendHistory(true)}
        >
          <div>{formattedDate}</div>
          <div>{formattedTime}</div>
        </div>
      </div>

      {/* Second row: Level, Streak, and Progress bar */}
      <div className="flex flex-col gap-4">
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
        
        {/* Progress bar */}
        <div className="flex-1">
          <div className="w-full h-8 border-4 border-black [image-rendering:pixelated] bg-gray-200">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${currentProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Popups */}
      {showSpendHistory && (
        <SpendHistory
          onClose={() => setShowSpendHistory(false)}
          history={spendingHistory}
        />
      )}

      {showFinancialPlan && openApiData && incomeData && (
        <FinancialPlanPopup
          onClose={() => setShowFinancialPlan(false)}
          username={username}
          openApiData={openApiData}
          incomeData={incomeData}
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