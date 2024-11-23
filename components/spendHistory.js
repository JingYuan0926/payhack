import React from "react";

const SpendHistory = ({ onClose, history }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      {/* Popup Content */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md z-[1100]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Spending History</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Spending History List */}
        <div className="space-y-4">
          {history.map((item, index) => (
            <div key={index} className="flex justify-between text-gray-700">
              <span>{item.description}</span>
              <span className="font-bold">${item.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpendHistory;
