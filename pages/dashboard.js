import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import expensesData from '@/data/expenses.json';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ExpenseDashboard = () => {
    const data = expensesData;

  // Process data for unpaid expenses
  const unpaidExpenses = data.expenses
    .filter(exp => exp.status === 'Unpaid')
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.category === curr.category);
      if (existing) {
        existing.amount += curr.amount;
      } else {
        acc.push({ category: curr.category, amount: curr.amount });
      }
      return acc;
    }, [])
    .sort((a, b) => b.amount - a.amount);

  // Process data for paid expenses
  const paidExpenses = data.expenses
    .filter(exp => exp.status === 'Paid')
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.category === curr.category);
      if (existing) {
        existing.amount += curr.amount;
      } else {
        acc.push({ category: curr.category, amount: curr.amount });
      }
      return acc;
    }, [])
    .sort((a, b) => b.amount - a.amount);

  // Process data for paid vs unpaid comparison
  const paidTotal = data.expenses
    .filter(exp => exp.status === 'Paid')
    .reduce((sum, curr) => sum + curr.amount, 0);

  const unpaidTotal = data.expenses
    .filter(exp => exp.status === 'Unpaid')
    .reduce((sum, curr) => sum + curr.amount, 0);

  const comparisonData = [
    { name: 'Total', paid: paidTotal, unpaid: unpaidTotal }
  ];

  // Process aging details
  const agingDetails = data.expenses
    .filter(exp => exp.status === 'Unpaid')
    .map(exp => ({
      id: exp.expense_id,
      category: exp.category,
      amount: exp.amount,
      dueDate: new Date(exp.due_date).toLocaleDateString(),
      overdueDays: exp.overdue_days
    }))
    .sort((a, b) => b.overdueDays - a.overdueDays);

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Unpaid Expenses Section */}
        <Card>
          <CardHeader>
            <CardTitle>Unpaid Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={unpaidExpenses}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={unpaidExpenses}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {unpaidExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Paid Expenses Section */}
        <Card>
          <CardHeader>
            <CardTitle>Paid Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={paidExpenses}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paidExpenses}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {paidExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

     {/* Paid vs Unpaid Comparison */}
<Card className="bg-white">
  <CardHeader>
    <CardTitle className="text-center">Paid vs Unpaid Expenses</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="h-[32rem]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 100, bottom: 60, left: 100 }}>
          <Pie
            data={[
              { name: 'Paid', value: paidTotal },
              { name: 'Unpaid', value: unpaidTotal }
            ]}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            outerRadius={150}
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              value,
              percent,
              name
            }) => {
              const RADIAN = Math.PI / 180;
              const radius = 35 + innerRadius + (outerRadius - innerRadius);
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              return (
                <text
                  x={x}
                  y={y}
                  fill="#000"
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  fontSize={14}
                >
                  {`${name}: $${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`}
                </text>
              );
            }}
          >
            {[
              { name: 'Paid', value: paidTotal, color: '#00C49F' },
              { name: 'Unpaid', value: unpaidTotal, color: '#FF8042' }
            ].map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
            percentFormatter={(value) => `${value.toFixed(1)}%`}
          />
          <Legend 
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            wrapperStyle={{ 
              fontSize: '14px',
              paddingTop: '20px',
              paddingBottom: '20px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </CardContent>
</Card>

      {/* Aging Details */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-center">Aging Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-300">
                  <th className="p-4 text-center font-semibold border-b">ID</th>
                  <th className="p-4 text-center font-semibold border-b">Category</th>
                  <th className="p-4 text-center font-semibold border-b">Amount</th>
                  <th className="p-4 text-center font-semibold border-b">Due Date</th>
                  <th className="p-4 text-center font-semibold border-b">Days Till Payment</th>
                </tr>
              </thead>
              <tbody>
                {agingDetails.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="p-4 text-center border-b">{item.id}</td>
                    <td className="p-4 text-center border-b">{item.category}</td>
                    <td className="p-4 text-center border-b">${item.amount.toLocaleString()}</td>
                    <td className="p-4 text-center border-b">{item.dueDate}</td>
                    <td className="p-4 text-center border-b">{item.overdueDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Expense Details */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-center">Expense Details</CardTitle>
        </CardHeader>
        <CardContent >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-300">
                  <th className="p-4 text-center font-semibold border-b">ID</th>
                  <th className="p-4 text-centerfont-semibold border-b">Category</th>
                  <th className="p-4 text-center font-semibold border-b">Amount</th>
                  <th className="p-4 text-center font-semibold border-b">Status</th>
                  <th className="p-4 text-center font-semibold border-b">Description</th>
                </tr>
              </thead>
              <tbody>
                {data.expenses.map((expense, index) => (
                  <tr 
                    key={expense.expense_id} 
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="p-4 text-center border-b">{expense.expense_id}</td>
                    <td className="p-4 text-center border-b">{expense.category}</td>
                    <td className="p-4 text-center border-b">${expense.amount.toLocaleString()}</td>
                    <td className="p-4 text-center border-b">{expense.status}</td>
                    <td className="p-4 text-center border-b">{expense.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseDashboard;