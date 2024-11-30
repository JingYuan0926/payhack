import { analyzeFinances } from './api/financial-analysis';
import openApiData from '../data/openapi.json';
import incomeData from '../data/income.json';

export default function TestPage() {
  const runTest = () => {
    try {
      const analysis = analyzeFinances(openApiData, incomeData);
      console.log('Test Results:', {
        success: true,
        data: analysis,
        details: {
          month: analysis.month,
          income: `RM ${analysis.income.toFixed(2)}`,
          plannedSavings: `RM ${analysis.savings.toFixed(2)}`,
          totalSpending: `RM ${analysis.totalSpending.toFixed(2)}`,
          disposableIncome: `RM ${analysis.disposableIncome.toFixed(2)}`,
          categories: Object.entries(analysis.spendingByCategory)
            .map(([category, amount]) => `${category}: RM ${amount.toFixed(2)}`)
        }
      });
    } catch (error) {
      console.error('Test Failed:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Financial Analysis Test Page</h1>
      
      <button 
        onClick={runTest}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Run Financial Analysis Test
      </button>
      
      <div className="mt-4">
        <p className="text-gray-600">
          Check the browser console (F12) to see the test results
        </p>
      </div>
    </div>
  );
} 