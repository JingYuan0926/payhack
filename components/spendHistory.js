import React, { useState, useEffect } from "react";

const SpendHistory = ({ onClose }) => {
  const [todayExpenses, setTodayExpenses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/expenses');
        if (!response.ok) {
          throw new Error('Failed to fetch expenses');
        }
        const data = await response.json();
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Filter today's expenses and sum by category
        const todaySum = data.expenses
          .filter(expense => expense.date === today)
          .reduce((acc, expense) => {
            if (!acc[expense.category]) {
              acc[expense.category] = 0;
            }
            acc[expense.category] += expense.amount;
            return acc;
          }, {});

        setTodayExpenses(todaySum);
      } catch (error) {
        console.error('Error fetching expenses:', error);
        setError('Failed to load expenses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000]">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md max-h-[80vh] overflow-y-auto z-[1100]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Today's Spending</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-4">
            <p>Loading expenses...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-4 text-red-600">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-4">
            {Object.entries(todayExpenses).length === 0 ? (
              <p className="text-center text-gray-500">No expenses recorded today</p>
            ) : (
              Object.entries(todayExpenses).map(([category, amount]) => (
                <div 
                  key={category} 
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{category}</span>
                    {category === 'Transportation' && (
                      <div className="relative group">
                        <span className="text-yellow-500 cursor-help">⚠</span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 ml-8 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[2000]">
                          Use card ending in 9932 instead of 6428 for cashbacks
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-green-600">
                    ${amount}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpendHistory;
