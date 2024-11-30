import React, { useMemo } from 'react';
import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const PaymentChannelUsage = ({ transactions, paymentChannels }) => {
  // Calculate payment channel usage statistics
  const channelStats = useMemo(() => {
    const stats = transactions.reduce((acc, transaction) => {
      const channel = transaction.paymentChannel;
      if (!acc[channel]) {
        acc[channel] = {
          name: channel,
          amount: 0,
          count: 0,
          transactions: [],
        };
      }
      acc[channel].amount += transaction.amount;
      acc[channel].count += 1;
      acc[channel].transactions.push(transaction);
      return acc;
    }, {});

    return Object.values(stats);
  }, [transactions]);

  // Calculate credit card specific usage
  const creditCardUsage = useMemo(() => {
    const creditCardTransactions = transactions.filter(t => t.paymentChannel === "Credit Card");
    
    // Map transactions to specific cards based on the transaction details
    return paymentChannels.creditCards.map(card => {
      const cardTransactions = creditCardTransactions.filter(t => 
        // You might need to adjust this logic based on how you identify which card was used
        t.description.includes(card.issuer) || t.description.toLowerCase().includes(card.type.toLowerCase())
      );

      return {
        ...card,
        transactionCount: cardTransactions.length,
        totalSpent: cardTransactions.reduce((sum, t) => sum + t.amount, 0),
        utilizationRate: ((card.usage / card.limit) * 100).toFixed(1)
      };
    });
  }, [transactions, paymentChannels]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const total = channelStats.reduce((sum, item) => sum + item.amount, 0);
  const statsWithPercentage = channelStats.map(item => ({
    ...item,
    percentage: ((item.amount / total) * 100).toFixed(1)
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Payment Channel Overview */}
      <Card className="w-full">
        <CardHeader className="flex flex-col gap-2">
          <h4 className="text-xl font-bold">Payment Channel Usage</h4>
          <p className="text-small text-default-500">
            Analysis of payment methods used in transactions
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chart */}
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsWithPercentage}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                  >
                    {statsWithPercentage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Stats Table */}
            <div className="flex flex-col gap-4">
              {statsWithPercentage.map((stat, index) => (
                <div
                  key={stat.name}
                  className="flex flex-col p-4 rounded-lg border border-default-200"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{stat.name}</span>
                    <span className="text-default-500">{stat.count} transactions</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-success">{formatCurrency(stat.amount)}</span>
                    <span className="text-small text-default-500">
                      {stat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Credit Card Usage Details */}
      <Card className="w-full">
        <CardHeader className="flex flex-col gap-2">
          <h4 className="text-xl font-bold">Credit Card Usage Analysis</h4>
          <p className="text-small text-default-500">
            Detailed breakdown of credit card utilization
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {creditCardUsage.map((card, index) => (
              <div key={card.cardNumber} className="flex flex-col gap-2 p-4 rounded-lg border border-default-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{card.type} - {card.issuer}</span>
                  <span className="text-small">{card.cardNumber}</span>
                </div>
                <Divider />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-small text-default-500">Credit Limit</p>
                    <p className="font-semibold">{formatCurrency(card.limit)}</p>
                  </div>
                  <div>
                    <p className="text-small text-default-500">Current Usage</p>
                    <p className="font-semibold">{formatCurrency(card.usage)}</p>
                  </div>
                  <div>
                    <p className="text-small text-default-500">Utilization Rate</p>
                    <p className="font-semibold">{card.utilizationRate}%</p>
                  </div>
                  <div>
                    <p className="text-small text-default-500">Available Credit</p>
                    <p className="font-semibold">{formatCurrency(card.limit - card.usage)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default PaymentChannelUsage;