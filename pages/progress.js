import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import transactionData from '../data/openapi.json';
import incomeData from '../data/income.json';
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
    const [catPosition, setCatPosition] = useState({ x: 0, y: 0 });
    const [animationFrame, setAnimationFrame] = useState(0);

    useEffect(() => {
        try {
            // Process and organize the data from all payment channels
            const processedData = {
                groceries: {
                    title: 'Groceries',
                    months: generateAllMonths(),
                    expenses: processExpenses('Groceries')
                },
                shopping: {
                    title: 'Shopping',
                    months: generateAllMonths(),
                    expenses: processExpenses('Shopping')
                },
                electronics: {
                    title: 'Electronics',
                    months: generateAllMonths(),
                    expenses: processExpenses('Electronics')
                },
                healthBeauty: {
                    title: 'Health & Beauty',
                    months: generateAllMonths(),
                    expenses: processExpenses('Health & Beauty')
                },
                homeLiving: {
                    title: 'Home & Living',
                    months: generateAllMonths(),
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

    useEffect(() => {
        if (!showSavings) return;
        
        const savingsData = processSavingsData();
        let frameId;
        let direction = 1; // 1 for forward, -1 for backward
        
        const animate = () => {
            setAnimationFrame(prev => {
                // Calculate next frame
                const nextFrame = prev + (0.03 * direction);
                
                // Check boundaries and reverse direction if needed
                if (nextFrame >= savingsData.months.length - 1) {
                    direction = -1;
                    return savingsData.months.length - 1;
                } else if (nextFrame <= 0) {
                    direction = 1;
                    return 0;
                }
                
                return nextFrame;
            });

            frameId = requestAnimationFrame(animate);
        };

        frameId = requestAnimationFrame(animate);

        return () => {
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
        };
    }, [showSavings]); // Only re-run when showSavings changes

    // Helper function to generate month labels
    const generateMonths = () => {
        const months = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Generate only even-numbered months for 2024
        for (let i = 0; i < monthNames.length; i++) {
            if (i % 2 === 0) { // Only add even-indexed months (0, 2, 4, 6, 8, 10)
                months.push(`${monthNames[i]} 2024`);
            }
        }
        return months;
    };

    // Add new function for all months (expenses view)
    const generateAllMonths = () => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthNames.map(month => `${month} 2024`);
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
                    expenses[merchant] = Array(12).fill(0); // 12 months
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
            autosize: true,
            width: undefined,
            height: undefined,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            hovermode: 'x unified',
            margin: { 
                t: 50,  // top margin
                r: 60,  // right margin for y2 axis
                l: 60,  // left margin for y axis
                b: 80   // bottom margin for x axis labels
            },
            showlegend: true,
            legend: {
                orientation: 'h',
                y: -0.2,  // Move legend down
                xanchor: 'center',
                x: 0.5
            },
            xaxis: { 
                tickangle: -45,  // Angle the x-axis labels
                automargin: true // Ensure labels are visible
            },
            yaxis: {
                automargin: true,
                title: {
                    standoff: 20  // Space between axis title and labels
                }
            },
            yaxis2: {
                automargin: true,
                title: {
                    standoff: 20
                }
            }
        };

        if (showSavings) {
            const savingsData = processSavingsData();
            const currentIndex = Math.floor(animationFrame);
            const nextIndex = Math.min(currentIndex + 1, savingsData.months.length - 1);
            const fraction = animationFrame - currentIndex;

            // Interpolate position between points
            const x = savingsData.months[currentIndex];
            const y = savingsData.income[currentIndex] + 
                (savingsData.income[nextIndex] - savingsData.income[currentIndex]) * fraction;

            baseLayout.images = [{
                source: "/walkingCat.gif",
                x: x,
                y: y,
                xref: "x",
                yref: "y2",
                sizex: 0.5,
                sizey: 300,
                xanchor: "center",
                yanchor: "middle"
            }];

            return {
                ...baseLayout,
                title: 'Savings vs Expenses Analysis',
                xaxis: { 
                    title: 'Months',
                    showgrid: true,
                    gridcolor: 'rgba(0,0,0,0.1)',
                    fixedrange: true
                },
                yaxis: { 
                    title: 'Expenses ($)',
                    showgrid: true,
                    gridcolor: 'rgba(0,0,0,0.1)',
                    fixedrange: true
                },
                yaxis2: {
                    title: 'Income & Savings ($)',
                    overlaying: 'y',
                    side: 'right',
                    showgrid: false,
                    fixedrange: true
                }
            };
        }
        return baseLayout;
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
        const months = generateMonths();
        const monthlyFinances = incomeData.user.monthly_finances;
        
        // Arrays to store the data (6 months for even months)
        const monthlyIncome = [];
        const monthlySavings = [];
        const monthlyExpenses = Array(6).fill(0);

        // Get all transactions for expenses
        const allTransactions = [
            ...getAllTransactions(transactionData.payment_channels.ewallet.usages),
            ...transactionData.payment_channels.debit_cards.flatMap(card => card.usages),
            ...transactionData.payment_channels.credit_cards.flatMap(card => card.usages)
        ];

        // Calculate total expenses per month (even months only)
        allTransactions.forEach(transaction => {
            const monthIndex = getMonthIndex(transaction.date);
            if (monthIndex % 2 === 0) {
                monthlyExpenses[Math.floor(monthIndex / 2)] += transaction.amount;
            }
        });

        // Get income and savings from income.json (even months only)
        Object.values(monthlyFinances).forEach((monthData, index) => {
            if (index % 2 === 0) {
                monthlyIncome.push(monthData.total_income);
                monthlySavings.push(monthData.total_savings);
            }
        });

        return {
            months: months,
            income: monthlyIncome,
            expenses: monthlyExpenses,
            savings: monthlySavings
        };
    };

    const getSavingsPlotData = () => {
        const savingsData = processSavingsData();
        
        return [
            // Income Line (Yellow)
            {
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Income',
                x: savingsData.months,
                y: savingsData.income,
                line: { 
                    color: 'rgb(234, 179, 8)',
                    width: 3 
                },
                marker: {
                    size: 8,
                    symbol: 'circle'
                },
                yaxis: 'y2'
            },
            // Expenses Bar (Blue)
            {
                type: 'bar',
                name: 'Expenses',
                x: savingsData.months,
                y: savingsData.expenses,
                marker: { 
                    color: 'rgba(59, 130, 246, 0.7)' 
                }
            },
            // Savings Line (Green)
            {
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Savings',
                x: savingsData.months,
                y: savingsData.savings,
                line: { 
                    color: 'rgb(34, 197, 94)',
                    width: 3 
                },
                marker: {
                    size: 8,
                    symbol: 'circle'
                },
                yaxis: 'y2'
            }
        ];
    };

    const handleHomeClick = () => {
        router.push('/map');
    };

    // Add this helper function to generate summary text
    const generateSummary = (savingsData) => {
        try {
            // Early return with default values if data is invalid
            if (!savingsData || !Array.isArray(savingsData.savings) || !Array.isArray(savingsData.income) || !Array.isArray(savingsData.expenses)) {
                console.log('Invalid savings data:', savingsData);
                return {
                    trend: 'unchanged',
                    amount: '0.00',
                    savingsRate: '0.0',
                    monthlyExpenses: '0.00',
                    monthlySavings: '0.00'
                };
            }

            // Ensure arrays have enough elements
            const lastIndex = Math.min(
                savingsData.savings.length - 1,
                savingsData.income.length - 1,
                savingsData.expenses.length - 1
            );
            
            const currentMonth = lastIndex;
            const prevMonth = Math.max(0, lastIndex - 1);
            
            // Ensure all values are numbers
            const currentSavings = Number(savingsData.savings[currentMonth]) || 0;
            const prevSavings = Number(savingsData.savings[prevMonth]) || 0;
            const currentIncome = Number(savingsData.income[currentMonth]) || 0;
            const currentExpenses = Number(savingsData.expenses[currentMonth]) || 0;
            
            const savingsDiff = currentSavings - prevSavings;
            const savingsRate = currentIncome > 0 ? ((currentSavings / currentIncome) * 100) : 0;

            return {
                trend: savingsDiff >= 0 ? 'increased' : 'decreased',
                amount: savingsDiff.toFixed(2),
                savingsRate: savingsRate.toFixed(1),
                monthlyExpenses: currentExpenses.toFixed(2),
                monthlySavings: currentSavings.toFixed(2)
            };
        } catch (error) {
            console.error('Error in generateSummary:', error);
            return {
                trend: 'unchanged',
                amount: '0.00',
                savingsRate: '0.0',
                monthlyExpenses: '0.00',
                monthlySavings: '0.00'
            };
        }
    };

    const updateCatPosition = (data) => {
        if (data && data.points && data.points[0]) {
            const point = data.points[0];
            setCatPosition({
                x: point.x,
                y: point.y
            });
        }
    };

    // Add this helper function to generate category summary
    const generateCategoryTrend = (category) => {
        if (!chartData || !chartData[category]) return null;
        
        const expenses = Object.values(chartData[category].expenses);
        const totalExpense = expenses.reduce((acc, curr) => acc + curr.reduce((a, b) => a + b, 0), 0);
        const monthlyAvg = totalExpense / 12;
        
        // Find highest spending month
        let highestMonth = 0;
        let highestAmount = 0;
        expenses.forEach(merchantExpenses => {
            merchantExpenses.forEach((amount, month) => {
                if (amount > highestAmount) {
                    highestAmount = amount;
                    highestMonth = month;
                }
            });
        });

        return {
            total: totalExpense.toFixed(2),
            monthly: monthlyAvg.toFixed(2),
            peakMonth: chartData[category].months[highestMonth],
            peakAmount: highestAmount.toFixed(2)
        };
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
            <header className="bg-white shadow-sm">
                <nav className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
                    <div className="flex flex-col md:flex-row justify-between h-auto md:h-12 py-2 md:py-0">
                        <button
                            onClick={handleHomeClick}
                            className="px-3 py-1 my-1 md:my-auto rounded-md bg-blue-600 text-white hover:bg-blue-700 
                                     transition-colors duration-200 flex items-center space-x-2 text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                            <span>Home</span>
                        </button>

                        <div className="flex flex-col md:flex-row md:space-x-8 space-y-1 md:space-y-0">
                            <a href="#" 
                               onClick={(e) => handleCategoryClick('groceries', e)}
                               className={`px-3 py-1 text-center rounded-md text-sm ${activeChart === 'groceries' ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-gray-900'}`}>
                                Groceries
                            </a>
                            <a href="#" 
                               onClick={(e) => handleCategoryClick('shopping', e)}
                               className={`px-3 py-1 text-center rounded-md text-sm ${activeChart === 'shopping' ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-gray-900'}`}>
                                Shopping
                            </a>
                            <a href="#" 
                               onClick={(e) => handleCategoryClick('electronics', e)}
                               className={`px-3 py-1 text-center rounded-md text-sm ${activeChart === 'electronics' ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-gray-900'}`}>
                                Electronics
                            </a>
                            <a href="#" 
                               onClick={(e) => handleCategoryClick('healthBeauty', e)}
                               className={`px-3 py-1 text-center rounded-md text-sm ${activeChart === 'healthBeauty' ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-gray-900'}`}>
                                Health & Beauty
                            </a>
                            <a href="#" 
                               onClick={(e) => handleCategoryClick('homeLiving', e)}
                               className={`px-3 py-1 text-center rounded-md text-sm ${activeChart === 'homeLiving' ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-gray-900'}`}>
                                Home & Living
                            </a>
                        </div>
                    </div>
                </nav>
            </header>
            <div className="max-w-7xl mx-auto p-3 md:p-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                    <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-0">Expense Analysis</h1>
                    <button
                        onClick={() => setShowSavings(!showSavings)}
                        className={`w-full md:w-auto px-4 py-2 rounded-md text-sm ${
                            showSavings ? 'bg-green-600 text-white' : 'bg-gray-200'
                        }`}
                    >
                        {showSavings ? 'Show Categories' : 'Show Savings'}
                    </button>
                </div>

                {showSavings ? (
                    <div className="mt-4 flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                        <div className="bg-white rounded-lg shadow-lg p-3 w-full md:w-4/5">
                            <Plot
                                data={getSavingsPlotData()}
                                layout={getLayout()}
                                config={{
                                    responsive: true,
                                    displayModeBar: false,
                                    scrollZoom: false
                                }}
                                useResizeHandler={true}
                                style={{ width: "100%", height: "400px" }}
                            />
                        </div>
                        
                        {/* Smaller container, same content */}
                        <div className="bg-white rounded-lg shadow-lg p-3 w-full md:w-1/5 text-sm">
                            <div className="flex items-center justify-center mb-3">
                                <img 
                                    src="/catWheel.gif" 
                                    alt="Cat Wheel" 
                                    className="w-16 h-16 object-contain"
                                />
                            </div>
                            
                            {(() => {
                                const summary = generateSummary(processSavingsData());
                                return (
                                    <div className="space-y-3">
                                        <h3 className="text-base font-bold text-gray-800 text-center">
                                            Monthly Summary
                                        </h3>
                                        
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <p className="text-xs text-gray-600">Your savings have {summary.trend} by</p>
                                            <p className="text-xl font-bold text-blue-600">
                                                ${summary.amount}
                                            </p>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Savings Rate:</span>
                                                <span className="font-bold text-green-600">{summary.savingsRate}%</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Monthly Expenses:</span>
                                                <span className="font-bold text-red-600">${summary.monthlyExpenses}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Monthly Savings:</span>
                                                <span className="font-bold text-green-600">${summary.monthlySavings}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-xs text-gray-500 text-center p-2 bg-gray-50 rounded-lg">
                                            {summary.savingsRate >= 20 
                                                ? "Great job! You're on track! 🎉"
                                                : "Consider reducing expenses 💪"}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                ) : (
                    activeChart && (
                        <div className="mt-6 flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
                            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-full md:flex-grow">
                                <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center justify-center">
                                    <button
                                        onClick={() => setViewMode('current')}
                                        className={`w-full md:w-auto px-6 py-3 rounded-lg text-lg ${viewMode === 'current' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
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
                                        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
                                            <span>Compare with:</span>
                                            <select
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                                className="w-full md:w-auto px-4 py-2 rounded border"
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
                                        displayModeBar: false,
                                        scrollZoom: false
                                    }}
                                    useResizeHandler={true}
                                    style={{ width: "100%", height: "400px" }}
                                />
                            </div>

                            {/* New Category Summary Box */}
                            {viewMode === 'year' && (
                                <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-full md:w-80">
                                    <div className="flex items-center justify-center mb-4">
                                        <img 
                                            src="/catWheel.gif" 
                                            alt="Cat Wheel" 
                                            className="w-24 h-24 object-contain"
                                        />
                                    </div>
                                    
                                    {(() => {
                                        const summary = generateCategoryTrend(activeChart);
                                        if (!summary) return null;
                                        
                                        return (
                                            <div className="space-y-4">
                                                <h3 className="text-xl font-bold text-gray-800 text-center">
                                                    {chartData[activeChart].title} Summary
                                                </h3>
                                                
                                                <div className="p-4 bg-blue-50 rounded-lg">
                                                    <p className="text-sm text-gray-600">Total Yearly Spending</p>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        ${summary.total}
                                                    </p>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Monthly Average:</span>
                                                        <span className="font-bold text-orange-600">
                                                            ${summary.monthly}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Peak Month:</span>
                                                        <span className="font-bold text-red-600">
                                                            {summary.peakMonth}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Peak Amount:</span>
                                                        <span className="font-bold text-red-600">
                                                            ${summary.peakAmount}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-sm text-gray-500 text-center mt-4">
                                                    {Number(summary.monthly) > 1000 
                                                        ? "Consider reducing spending in this category 🤔"
                                                        : "Spending in this category looks reasonable 👍"}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
        </div>
     );
}
 
export default Progress; 