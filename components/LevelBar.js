import { useState } from "react";
import FinancialPlanPopup from "./FinancialPlanPopup";
import SpendHistory from "./spendHistory";

export default function LevelBar({ username = "Username", progress = 60 }) {
  const [showFinancialPlan, setShowFinancialPlan] = useState(false);
  const [showSpendHistory, setShowSpendHistory] = useState(false);

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  const formattedTime = currentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="p-4 flex justify-between items-start">
      <div className="w-[30%] ml-8">
        <div className="text-lg font-bold mb-2 flex items-center">
          <span>{username}</span>
          <button
            onClick={() => setShowFinancialPlan(true)}
            className="ml-2 px-2 py-0.5 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none"
          >
            +
          </button>
        </div>
        <div className="w-full h-6 border-4 border-black [image-rendering:pixelated] bg-gray-200">
          <div
            className="h-full bg-green-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div
        className="text-lg font-bold font-mono mr-8 text-right cursor-pointer hover:text-blue-600"
        onClick={() => setShowSpendHistory(true)}
      >
        <div>{formattedDate}</div>
        <div>{formattedTime}</div>
      </div>

      {showSpendHistory && (
        <SpendHistory
          onClose={() => setShowSpendHistory(false)}
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
