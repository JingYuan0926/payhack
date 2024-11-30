function getCurrentMonth() {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentDate = new Date();
    return months[currentDate.getMonth()];
  }
  
  function calculateMonthlySpending(transactions) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
  
    // Filter transactions for current month
    const monthlyTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() + 1 === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
  
    // Calculate total spending and spending by category
    const spending = {
      total: 0,
      byCategory: {},
      byPaymentMethod: {}
    };
  
    monthlyTransactions.forEach(transaction => {
      spending.total += transaction.amount;
      
      // Track spending by category
      if (!spending.byCategory[transaction.category]) {
        spending.byCategory[transaction.category] = 0;
      }
      spending.byCategory[transaction.category] += transaction.amount;

      // Track spending by payment method
      if (!spending.byPaymentMethod[transaction.paymentMethod]) {
        spending.byPaymentMethod[transaction.paymentMethod] = 0;
      }
      spending.byPaymentMethod[transaction.paymentMethod] += transaction.amount;
    });
  
    return spending;
  }
  
  export function analyzeFinances(openApiData, incomeData) {
    const currentMonth = getCurrentMonth();
    const monthlyFinances = incomeData.user.monthly_finances[currentMonth];
    
    // Collect all transactions from different payment channels
    const allTransactions = [];

    // Add eWallet transactions
    if (openApiData.payment_channels?.ewallet?.usages) {
      const ewalletTransactions = openApiData.payment_channels.ewallet.usages.map(tx => ({
        ...tx,
        paymentMethod: 'eWallet'
      }));
      allTransactions.push(...ewalletTransactions);
    }

    // Add debit card transactions
    if (openApiData.payment_channels?.debit_cards) {
      openApiData.payment_channels.debit_cards.forEach(card => {
        if (card.usages) {
          const debitTransactions = card.usages.map(tx => ({
            ...tx,
            paymentMethod: 'Debit Card',
            cardNumber: card.card_number
          }));
          allTransactions.push(...debitTransactions);
        }
      });
    }

    // Add credit card transactions
    if (openApiData.payment_channels?.credit_cards) {
      openApiData.payment_channels.credit_cards.forEach(card => {
        if (card.usages) {
          const creditTransactions = card.usages.map(tx => ({
            ...tx,
            paymentMethod: 'Credit Card',
            cardNumber: card.card_number
          }));
          allTransactions.push(...creditTransactions);
        }
      });
    }

    // Add bank account transactions
    if (openApiData.payment_channels?.bank_accounts) {
      openApiData.payment_channels.bank_accounts.forEach(account => {
        if (account.transactions) {
          const bankTransactions = account.transactions.map(tx => ({
            ...tx,
            paymentMethod: 'Bank Account',
            accountNumber: account.account_number
          }));
          allTransactions.push(...bankTransactions);
        }
      });
    }
  
    const monthlySpending = calculateMonthlySpending(allTransactions);
    
    const analysis = {
      month: currentMonth,
      income: monthlyFinances.total_income,
      savings: monthlyFinances.total_savings,
      totalSpending: monthlySpending.total,
      spendingByCategory: monthlySpending.byCategory,
      spendingByPaymentMethod: monthlySpending.byPaymentMethod,
      disposableIncome: monthlyFinances.total_income - monthlyFinances.total_savings - monthlySpending.total,
      totalTransactions: allTransactions.length
    };
  
    console.log('Financial Analysis:', {
      month: analysis.month,
      totalIncome: `RM ${analysis.income.toFixed(2)}`,
      plannedSavings: `RM ${analysis.savings.toFixed(2)}`,
      totalSpending: `RM ${analysis.totalSpending.toFixed(2)}`,
      disposableIncome: `RM ${analysis.disposableIncome.toFixed(2)}`,
      totalTransactions: analysis.totalTransactions,
      spendingBreakdown: {
        byCategory: Object.entries(analysis.spendingByCategory)
          .map(([category, amount]) => `${category}: RM ${amount.toFixed(2)}`),
        byPaymentMethod: Object.entries(analysis.spendingByPaymentMethod)
          .map(([method, amount]) => `${method}: RM ${amount.toFixed(2)}`)
      }
    });
  
    return analysis;
  }