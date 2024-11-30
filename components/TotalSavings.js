import { useState, useEffect } from 'react';

export default function TotalSavings({ onClose, showPopup }) {
  const [isVisible, setIsVisible] = useState(false);
  const [savingsData] = useState([
    { date: '28/11', amount: 57.50 },
    { date: '29/11', amount: 55.80 },
    { date: '30/11', amount: 58.20 },
    { date: '1/12', amount: 60.00 },
  ]);

  useEffect(() => {
    if (showPopup) {
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [showPopup]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getBarHeight = (amount) => {
    const maxAmount = 100;
    return (amount / maxAmount) * 100;
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-5xl font-bold pixel-text-blue">
            TOTAL SAVINGS
          </h3>
        </div>

        <div className="space-y-4">
          {/* Summary Card */}
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <div className="text-center">
              <p className="font-bold text-blue-800 text-3xl">DAILY AVERAGE SAVINGS</p>
              <p className="text-6xl font-bold text-blue-600 mt-2">
                RM {(savingsData.reduce((acc, curr) => acc + curr.amount, 0) / savingsData.length).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-4 rounded-lg">
            <h4 className="text-2xl font-bold mb-4">DAILY SAVINGS TREND (RM)</h4>
            <div className="flex items-end justify-between h-48 gap-4">
              {savingsData.map((day, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full relative" style={{ height: '160px' }}>
                    <div 
                      className={`w-full absolute bottom-0 rounded-t-lg transition-all duration-500 ${
                        day.date === '1/12' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ 
                        height: `${getBarHeight(day.amount)}%`,
                        animation: 'growUp 1s ease-out'
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xl font-bold">
                         {day.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-2xl font-bold">
                    {day.date}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 text-xl font-bold">HIGHEST SAVING</p>
              <p className="text-3xl font-bold text-gray-800">
                RM {Math.max(...savingsData.map(d => d.amount)).toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 text-xl font-bold">LOWEST SAVING</p>
              <p className="text-3xl font-bold text-gray-800">
                RM {Math.min(...savingsData.map(d => d.amount)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="text-2xl px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-bold"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

// Add this CSS to your global styles or within the component if using styled-components
const styles = `
  @keyframes growUp {
    from {
      height: 0;
    }
    to {
      height: var(--final-height);
    }
  }
`; 