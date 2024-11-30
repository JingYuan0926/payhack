import React from 'react';

export default function LeaderboardModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const mockLeaderboardData = [
    { rank: 1, username: "TOM THE CAT", level: 5, streak: 7 },
    { rank: 2, username: "SAVINGS MASTER", level: 4, streak: 12 },
    { rank: 3, username: "BUDGET PRO", level: 4, streak: 3 },
    { rank: 4, username: "MONEY SAVER", level: 3, streak: 5 },
    { rank: 5, username: "FINANCE GURU", level: 3, streak: 2 },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 w-[40rem] max-w-[90%]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-bold pixel-text-blue">LEADERBOARD</h2>
            <span className="text-4xl">🏆</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          {mockLeaderboardData.map((player) => (
            <div
              key={player.rank}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-6">
                <span className="font-bold pixel-text-blue text-3xl min-w-[3rem]">{player.rank}.</span>
                <span className="relative pixel-text-blue text-3xl group">
                  {player.username}
                  {player.username === "SAVINGS MASTER" && (
                    <img
                      src="/visit.png"
                      alt="Visit"
                      className="absolute left-1/2 -top-16 transform -translate-x-1/2 w-300 h-300 opacity-0 group-hover:opacity-100 transition-opacity z-[10000]"
                    />
                  )}
                </span>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center">
                  <span className="pixel-text-golden text-3xl whitespace-nowrap">LVL {player.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🔥</span>
                  <span className="pixel-text-golden text-3xl min-w-[2rem] text-right">{player.streak}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 