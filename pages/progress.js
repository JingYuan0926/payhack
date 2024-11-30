import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import transactionData from '../data/openapi.json';
import { useRouter } from 'next/router';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const Progress = () => {
    const router = useRouter();
    const [activeChart, setActiveChart] = useState(null);
    const [viewMode, setViewMode] = useState('current');
    const [selectedMonth, setSelectedMonth] = useState(22);
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSavings, setShowSavings] = useState(true);

    useEffect(() => {
        try {
            // Process and organize the data from all payment channels
            const processedData = {
                groceries: {
                    title: 'Groceries',
                    months: generateMonths(),
                    expenses: processExpenses('Groceries')
                },
                shopping: {
                    title: 'Shopping',
                    months: generateMonths(),
                    expenses: processExpenses('Shopping')
                },
                electronics: {
                    title: 'Electronics',
                    months: generateMonths(),
                    expenses: processExpenses('Electronics')
                },
                healthBeauty: {
                    title: 'Health & Beauty',
                    months: generateMonths(),
                    expenses: processExpenses('Health & Beauty')
                },
                homeLiving: {
                    title: 'Home & Living',
                    months: generateMonths(),
                    expenses: processExpenses('Home & Living')
                }
            };

            setChartData(processedData);
            setIsLoading(false);
        } catch (error) {
            console.error('Error processing transaction data:', error);
            setIsLoading(false);
        }
    }, []);

    // Helper function to generate month labels
    const generateMonths = () => {
        const months = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Generate months for 2024
        for (let month of monthNames) {
            months.push(`${month} 2024`);
        }
        return months;
    };

    // Helper function to process expenses by merchant
    const processExpenses = (category) => {
        const expenses = {};
        const monthlyTotals = Array(12).fill(0); // 12 months for 2024

        // Get all transactions from all payment channels
        const allTransactions = [
            ...getAllTransactions(transactionData.payment_channels.ewallet.usages),
            ...transactionData.payment_channels.debit_cards.flatMap(card => card.usages),
            ...transactionData.payment_channels.credit_cards.flatMap(card => card.usages)
        ];

        // Filter and group transactions by merchant
        allTransactions
            .filter(t => t.category === category)
            .forEach(transaction => {
                const monthIndex = getMonthIndex(transaction.date);
                const merchant = transaction.merchant;

                if (!expenses[merchant]) {
                    expenses[merchant] = Array(12).fill(0);
                }

                expenses[merchant][monthIndex] += transaction.amount;
                monthlyTotals[monthIndex] += transaction.amount;
            });

        return expenses;
    };

    // Helper function to get all transactions from ewallet
    const getAllTransactions = (usages) => {
        return usages.map(usage => ({
            date: usage.date,
            amount: usage.amount,
            category: usage.category,
            merchant: usage.merchant
        }));
    };

    // Helper function to get month index (0-11) from date string
    const getMonthIndex = (dateString) => {
        const date = new Date(dateString);
        return date.getMonth();
    };

    const handleCategoryClick = (category, e) => {
        e.preventDefault();
        setActiveChart(activeChart === category ? null : category);
    };

    const getCurrentMonthName = () => {
        return chartData[activeChart]?.months[11]; // December 2024
    };

    const getPlotData = () => {
        if (!activeChart) return [];

        const currentData = chartData[activeChart];
        
        try {
            if (viewMode === 'year') {
                return Object.entries(currentData.expenses).map(([category, values]) => ({
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: category,
                    x: currentData.months,
                    y: values,
                    hoverinfo: 'y+name',
                }));
            } else if (viewMode === 'month') {
                const currentMonth = 11; // December 2024
                const selectedMonthName = currentData.months[selectedMonth];
                const currentMonthName = currentData.months[currentMonth];
                
                return Object.entries(currentData.expenses).map(([category, values]) => ({
                    type: 'bar',
                    name: category,
                    x: [selectedMonthName, currentMonthName],
                    y: [values[selectedMonth], values[currentMonth]],
                    hoverinfo: 'y+name',
                }));
            } else {
                return [{
                    type: 'bar',
                    x: Object.keys(currentData.expenses),
                    y: Object.values(currentData.expenses).map(values => values[11]), // December 2024
                    marker: { color: 'rgb(59, 130, 246)' },
                    hoverinfo: 'y',
                }];
            }
        } catch (error) {
            console.error('Error in getPlotData:', error);
            return [];
        }
    };

    const getLayout = () => {
        const baseLayout = {
            width: 1000,
            height: 600,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            hovermode: 'closest',
            margin: { t: 60, r: 60, l: 60, b: 60 },
            showlegend: true,
            legend: {
                orientation: 'h',
                y: -0.15
            }
        };

        if (showSavings) {
            return {
                ...baseLayout,
                title: 'Savings vs Expenses Analysis',
                xaxis: { 
                    title: 'Months',
                    showgrid: true,
                    gridcolor: 'rgba(0,0,0,0.1)'
                },
                yaxis: { 
                    title: 'Expenses ($)',
                    showgrid: true,
                    gridcolor: 'rgba(0,0,0,0.1)'
                },
                yaxis2: {
                    title: 'Savings ($)',
                    overlaying: 'y',
                    side: 'right',
                    showgrid: false,
                    gridcolor: 'rgba(0,0,0,0.1)'
                }
            };
        }

        return { ...baseLayout, /* your existing layout properties */ };
    };

    const calculateTotal = () => {
        if (!activeChart) return 0;

        const currentData = chartData[activeChart];
        
        if (viewMode === 'year') {
            // Calculate total for all months
            return Object.values(currentData.expenses).reduce((total, values) => {
                return total + values.reduce((sum, value) => sum + value, 0);
            }, 0);
        } else if (viewMode === 'month') {
            // Calculate total for both selected and current month
            const currentMonth = 11;
            const currentTotal = Object.values(currentData.expenses)
                .reduce((total, values) => total + values[currentMonth], 0);
            const selectedTotal = Object.values(currentData.expenses)
                .reduce((total, values) => total + values[selectedMonth], 0);
            return { currentTotal, selectedTotal };
        } else {
            // Calculate total for current month
            return Object.values(currentData.expenses)
                .reduce((total, values) => total + values[11], 0);
        }
    };

    const renderTotalSpending = () => {
        if (!activeChart) return null;

        const total = calculateTotal();
        
        if (viewMode === 'year') {
            return (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h2 className="text-lg font-semibold">Total Spending (All Time)</h2>
                    <p className="text-2xl text-blue-600">${total.toFixed(2)}</p>
                </div>
            );
        } else if (viewMode === 'month') {
            return (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg flex space-x-8">
                    <div>
                        <h2 className="text-lg font-semibold">Selected Month ({chartData[activeChart].months[selectedMonth]})</h2>
                        <p className="text-2xl text-blue-600">${total.selectedTotal.toFixed(2)}</p>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Current Month ({getCurrentMonthName()})</h2>
                        <p className="text-2xl text-blue-600">${total.currentTotal.toFixed(2)}</p>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Difference</h2>
                        <p className={`text-2xl ${total.currentTotal - total.selectedTotal > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${(total.currentTotal - total.selectedTotal).toFixed(2)}
                        </p>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h2 className="text-lg font-semibold">Total Spending ({getCurrentMonthName()})</h2>
                    <p className="text-2xl text-blue-600">${total.toFixed(2)}</p>
                </div>
            );
        }
    };

    const processSavingsData = () => {
        const monthlyIncome = 2000; // Example fixed monthly income
        const monthlyExpenses = {};
        const monthlySavings = {};
        const months = generateMonths();

        // Get all transactions
        const allTransactions = [
            ...getAllTransactions(transactionData.payment_channels.ewallet.usages),
            ...transactionData.payment_channels.credit_cards.flatMap(card => card.usages)
        ];

        // Calculate total expenses per month
        allTransactions.forEach(transaction => {
            const monthIndex = getMonthIndex(transaction.date);
            monthlyExpenses[monthIndex] = (monthlyExpenses[monthIndex] || 0) + transaction.amount;
        });

        // Calculate savings (Income - Expenses)
        months.forEach((_, index) => {
            monthlySavings[index] = monthlyIncome - (monthlyExpenses[index] || 0);
        });

        return {
            expenses: Object.values(monthlyExpenses),
            savings: Object.values(monthlySavings),
            months: months
        };
    };

    const getSavingsPlotData = () => {
        const savingsData = processSavingsData();
        
        return [
            {
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Savings',
                x: savingsData.months,
                y: savingsData.savings,
                line: { color: 'rgb(34, 197, 94)' },
                yaxis: 'y2'
            },
            {
                type: 'bar',
                name: 'Expenses',
                x: savingsData.months,
                y: savingsData.expenses,
                marker: { color: 'rgb(59, 130, 246)' }
            }
        ];
    };

    const handleHomeClick = () => {
        router.push('/map');
    };

    if (isLoading || !chartData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return ( 
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <button
                            onClick={handleHomeClick}
                            className="px-4 py-2 my-auto rounded-lg bg-blue-600 text-white hover:bg-blue-700 
                                     transition-colors duration-200 flex items-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                            <span>Home</span>
                        </button>

                        <div className="flex space-x-12">
                            <a href="#" 
                               onClick={(e) => handleCategoryClick('groceries', e)}
                               className={`px-4 py-2 rounded-md ${activeChart === 'groceries' ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-gray-900'}`}>
                                Groceries
                            </a>
                            <a href="#" 
                               onClick={(e) => handleCategoryClick('shopping', e)}
                               className={`px-3 py-2 rounded-md ${activeChart === 'shopping' ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-gray-900'}`}>
                                Shopping
                            </a>
                            <a href="#" 
                               onClick={(e) => handleCategoryClick('electronics', e)}
                               className={`px-3 py-2 rounded-md ${activeChart === 'electronics' ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-gray-900'}`}>
                                Electronics
                            </a>
                            <a href="#" 
                               onClick={(e) => handleCategoryClick('healthBeauty', e)}
                               className={`px-3 py-2 rounded-md ${activeChart === 'healthBeauty' ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-gray-900'}`}>
                                Health & Beauty
                            </a>
                            <a href="#" 
                               onClick={(e) => handleCategoryClick('homeLiving', e)}
                               className={`px-3 py-2 rounded-md ${activeChart === 'homeLiving' ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-gray-900'}`}>
                                Home & Living
                            </a>
                        </div>

                        <div className="w-[100px]"></div>
                    </div>
                </nav>
            </header>
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Expense Analysis</h1>
                    <button
                        onClick={() => setShowSavings(!showSavings)}
                        className={`px-6 py-3 rounded-lg text-lg ${
                            showSavings ? 'bg-green-600 text-white' : 'bg-gray-200'
                        }`}
                    >
                        {showSavings ? 'Show Categories' : 'Show Savings'}
                    </button>
                </div>

                {showSavings ? (
                    <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                        <Plot
                            data={getSavingsPlotData()}
                            layout={getLayout()}
                            config={{
                                responsive: true,
                                displayModeBar: false
                            }}
                        />
                    </div>
                ) : (
                    activeChart && (
                        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                            <div className="mb-6 flex space-x-4 items-center justify-center">
                                <button
                                    onClick={() => setViewMode('current')}
                                    className={`px-6 py-3 rounded-lg text-lg ${viewMode === 'current' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                                >
                                    {getCurrentMonthName()}
                                </button>
                                <button
                                    onClick={() => setViewMode('year')}
                                    className={`px-4 py-2 rounded ${viewMode === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                                >
                                    Yearly Trend
                                </button>
                                <button
                                    onClick={() => setViewMode('month')}
                                    className={`px-4 py-2 rounded ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                                >
                                    Compare Months
                                </button>
                                
                                {viewMode === 'month' && (
                                    <div className="flex items-center space-x-2">
                                        <span>Compare with:</span>
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                            className="px-4 py-2 rounded border"
                                        >
                                            {chartData[activeChart].months.map((month, index) => (
                                                <option key={month} value={index} disabled={index === 11}>
                                                    {month}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            
                            {renderTotalSpending()}
                            
                            <Plot
                                data={getPlotData()}
                                layout={getLayout()}
                                config={{
                                    responsive: true,
                                    displayModeBar: false
                                }}
                            />
                        </div>
                    )
                )}
            </div>
        </div>
     );
}
 
export default Progress; 