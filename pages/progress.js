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
    const [catDirection, setCatDirection] = useState('left');

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
        if (!showSavings) {
            setCatDirection('right');
        } else {
            setCatDirection('left');
        }
    }, [showSavings]);

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
        setActiveChart(category === '' ? null : category);
    };

    const getCurrentMonthName = () => {
        return chartData[activeChart]?.months[11]; // December 2024
    };

    const getPlotData = () => {
        if (!activeChart) return [];

        const currentData = chartData[activeChart];
        const currentMonth = 11; // December 2024

        if (compareMonth) {
            // Comparison view
            return Object.entries(currentData.expenses).map(([category, values]) => ({
                type: 'bar',
                name: category,
                x: [currentData.months[compareMonth], currentData.months[currentMonth]],
                y: [values[compareMonth], values[currentMonth]],
                hoverinfo: 'y+name',
            }));
        } else {
            // Single month view
            return [{
                type: 'bar',
                x: Object.keys(currentData.expenses),
                y: Object.values(currentData.expenses).map(values => values[currentMonth]),
                marker: { color: 'rgb(59, 130, 246)' },
                hoverinfo: 'y',
            }];
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
                t: 30,
                r: 50,
                l: 50,
                b: 60
            },
            showlegend: true,
            legend: {
                orientation: 'h',
                y: -0.15,
                xanchor: 'center',
                x: 0.5,
                traceorder: 'normal',
                tracegroupgap: 0
            },
            xaxis: { 
                title: 'Months',
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)',
                fixedrange: true,
                tickangle: -45,
                automargin: true,
                tickfont: { size: 10 }
            },
            yaxis: { 
                title: 'Expenses ($)',
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)',
                fixedrange: true,
                tickfont: { size: 10 },
                title: {
                    standoff: 15
                }
            },
            yaxis2: {
                title: 'Income & Savings ($)',
                overlaying: 'y',
                side: 'right',
                showgrid: false,
                fixedrange: true,
                tickfont: { size: 10 },
                title: {
                    standoff: 15
                }
            },
            showlegend: false
        };

        if (showSavings) {
            return {
                ...baseLayout,
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

        const currentData = chartData[activeChart];
        const currentMonth = 11; // December 2024
        
        if (compareMonth) {
            const compareTotal = Object.values(currentData.expenses)
                .reduce((total, values) => total + values[compareMonth], 0);
            const currentTotal = Object.values(currentData.expenses)
                .reduce((total, values) => total + values[currentMonth], 0);
            const difference = currentTotal - compareTotal;

            return (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg flex space-x-8">
                    <div>
                        <h2 className="text-lg font-semibold">Selected Month ({currentData.months[compareMonth]})</h2>
                        <p className="text-2xl text-blue-600">${compareTotal.toFixed(2)}</p>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Current Month ({currentData.months[currentMonth]})</h2>
                        <p className="text-2xl text-blue-600">${currentTotal.toFixed(2)}</p>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Difference</h2>
                        <p className={`text-2xl ${difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${difference.toFixed(2)}
                        </p>
                    </div>
                </div>
            );
        } else {
            const total = Object.values(currentData.expenses)
                .reduce((total, values) => total + values[currentMonth], 0);
            
            return (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h2 className="text-lg font-semibold">Total Spending ({currentData.months[currentMonth]})</h2>
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

    // Add this helper function at the top of the Progress component
    const getNextViewMode = (currentMode) => {
        const modes = ['current', 'year', 'month'];
        const currentIndex = modes.indexOf(currentMode);
        return modes[(currentIndex + 1) % modes.length];
    };

    if (isLoading || !chartData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return ( 
        <div className="min-h-screen bg-gray-50">
            {/* Home button header - always visible */}
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

                        {!showSavings && (
                            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 md:max-w-[70%]">
                                <div className="flex flex-row md:space-x-8 min-w-max px-2">
                                    <a href="#" 
                                       onClick={(e) => handleCategoryClick('groceries', e)}
                                       className={`px-3 py-1 text-center rounded-md text-sm whitespace-nowrap ${activeChart === 'groceries' ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-gray-900'}`}>
                                        Groceries
                                    </a>
                                    <a href="#" 
                                       onClick={(e) => handleCategoryClick('shopping', e)}
                                       className={`px-3 py-1 text-center rounded-md text-sm whitespace-nowrap ${activeChart === 'shopping' ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-gray-900'}`}>
                                        Shopping
                                    </a>
                                    <a href="#" 
                                       onClick={(e) => handleCategoryClick('electronics', e)}
                                       className={`px-3 py-1 text-center rounded-md text-sm whitespace-nowrap ${activeChart === 'electronics' ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-gray-900'}`}>
                                        Electronics
                                    </a>
                                    <a href="#" 
                                       onClick={(e) => handleCategoryClick('healthBeauty', e)}
                                       className={`px-3 py-1 text-center rounded-md text-sm whitespace-nowrap ${activeChart === 'healthBeauty' ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-gray-900'}`}>
                                        Health & Beauty
                                    </a>
                                    <a href="#" 
                                       onClick={(e) => handleCategoryClick('homeLiving', e)}
                                       className={`px-3 py-1 text-center rounded-md text-sm whitespace-nowrap ${activeChart === 'homeLiving' ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-gray-900'}`}>
                                        Home & Living
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            </header>
            <div className="max-w-7xl mx-auto p-3 md:p-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                    <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-0">
                        {showSavings ? 'Expense & Savings Analysis' : 'Expense Analysis'}
                    </h1>
                    <div className="flex items-center space-x-4">
                        <img
                            src="/walkingCat.gif"
                            alt="Walking Cat"
                            className={`w-16 h-16 object-contain transform ${catDirection === 'right' ? 'scale-x-[-1]' : ''} transition-transform duration-500`}
                            onClick={() => {
                                setShowSavings(!showSavings);
                                setCatDirection(catDirection === 'left' ? 'right' : 'left');
                            }}
                        />
                        <span className="transition-opacity duration-500">
                            {showSavings ? 'Showing savings + expenses' : 'Showing expenses'}
                        </span>
                    </div>
                </div>

            {/* Toggle button */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <button
                    onClick={() => setShowSavings(!showSavings)}
                    className="w-full py-3 text-center rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                    {showSavings ? 'VIEWING SAVINGS SUMMARY' : 'VIEWING EXPENSES'}
                </button>
            </div>

            {/* Savings Analysis View */}
            {showSavings && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Plot
                        data={getSavingsPlotData()}
                        layout={getLayout()}
                        config={{ responsive: true }}
                        style={{ width: '100%', height: '500px' }}
                    />
                </div>
            )}

            {/* Expenses Analysis View */}
            {!showSavings && (
                <div>
                    {/* Expense Analysis title and Category Dropdowns */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <h1 className="text-2xl font-bold text-center mb-4">EXPENSE ANALYSIS</h1>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Category Selection */}
                            <select
                                value={activeChart || ''}
                                onChange={(e) => handleCategoryClick(e.target.value, e)}
                                className="w-full p-3 text-center rounded-md bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Category</option>
                                <option value="groceries">GROCERIES</option>
                                <option value="shopping">SHOPPING</option>
                                <option value="electronics">ELECTRONICS</option>
                                <option value="healthBeauty">HEALTH + BEAUTY</option>
                                <option value="homeLiving">HOME + LIVING</option>
                            </select>

                            {/* Comparison Month Selection */}
                            <select
                                value={compareMonth || ''}
                                onChange={(e) => setCompareMonth(e.target.value)}
                                className="w-full p-3 text-center rounded-md bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">No Comparison</option>
                                <option value="0">January 2024</option>
                                <option value="1">February 2024</option>
                                <option value="2">March 2024</option>
                                <option value="3">April 2024</option>
                                <option value="4">May 2024</option>
                                <option value="5">June 2024</option>
                                <option value="6">July 2024</option>
                                <option value="7">August 2024</option>
                                <option value="8">September 2024</option>
                                <option value="9">October 2024</option>
                                <option value="10">November 2024</option>
                                <option value="11">December 2024</option>
                            </select>
                        </div>
                    </div>
                ) : (
                    !activeChart ? (
                        // Updated empty state with happyCat.gif and better centering
                        <div className="flex flex-col items-center justify-center min-h-[60vh]">
                            <img 
                                src="/happyCat.gif"
                                alt="Happy Cat"
                                className="w-64 h-64 object-contain mb-6"
                            />
                            <p className="text-xl text-gray-600 font-medium text-center">
                                Select a category above to view your expenses
                            </p>
                        </div>
                    ) : (
                        <div className="mt-6 flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
                            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-full md:flex-grow">
                                <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center justify-center">
                                    <button
                                        onClick={() => setViewMode(getNextViewMode(viewMode))}
                                        className="w-full md:w-auto px-6 py-3 rounded-lg text-lg bg-blue-600 text-white"
                                    >
                                        {viewMode === 'current' ? getCurrentMonthName() :
                                         viewMode === 'year' ? 'Yearly Trend' : 'Compare Months'}
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
                                    config={{ responsive: true }}
                                    style={{ width: '100%', height: '500px' }}
                                />
                                {renderTotalSpending()}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8">
                                <img 
                                    src="/placeholder-select-category.png" 
                                    alt="Please select a category"
                                    className="w-64 h-64 object-contain mb-4"
                                />
                                <p className="text-xl text-gray-600 font-semibold">
                                    Please select a category to view expenses
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
     );
}
 
export default Progress; 