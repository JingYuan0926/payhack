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
        <div className="pt-10 px-40 space-y-10 bg-gray-300 text-center">
            <h1 className="text-4xl">Financial Analysis</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
        {/* Unpaid Expenses Section */}
<Card>
  <CardHeader>
    <CardTitle className="text-center">Unpaid Expenses by Category</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={unpaidExpenses}
          layout="vertical"
          margin={{ top: 20, right: 60, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number"
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <YAxis 
            dataKey="category" 
            type="category"
            width={110}
            tick={{ 
              fontSize: 12,
              width: 110,
              textOverflow: 'ellipsis',
              wordWrap: 'break-word'
            }}
            interval={0}
            tickFormatter={(value) => {
              return value.replace(/ /g, '\u00A0');
            }}
          />
          <Tooltip 
            formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
          />
          <Bar 
            dataKey="amount" 
            fill="#0088FE"
            label={{ 
              position: 'right',
              formatter: (value) => `$${value.toLocaleString()}`,
              fontSize: 12
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="h-96 mt-8">
      <ResponsiveContainer width="110%" height="100%">
        <PieChart>
          <Pie
            data={unpaidExpenses}
            dataKey="amount"
            nameKey="category"
            cx="46%"
            cy="50%"
            outerRadius={130}
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              value,
              index
            }) => {
              const RADIAN = Math.PI / 180;
              const radius = 25 + innerRadius + (outerRadius - innerRadius);
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              return (
                <text
                  x={x}
                  y={y}
                  fill="#000"
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  fontSize={12}
                >
                  {`${unpaidExpenses[index].category} ($${value.toLocaleString()})`}
                </text>
              );
            }}
          >
            {unpaidExpenses.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            wrapperStyle={{ 
              fontSize: '12px',
              paddingTop: '30px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </CardContent>
</Card>

{/* Paid Expenses Section */}
<Card>
  <CardHeader>
    <CardTitle className="text-center">Paid Expenses by Category</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={paidExpenses}
          layout="vertical"
          margin={{ top: 20, right: 60, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number"
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <YAxis 
            dataKey="category" 
            type="category"
            width={110}
            tick={{ 
              fontSize: 12,
              width: 110,
              textOverflow: 'ellipsis',
              wordWrap: 'break-word'
            }}
            interval={0}
            tickFormatter={(value) => {
              return value.replace(/ /g, '\u00A0');
            }}
          />
          <Tooltip 
            formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
          />
          <Bar 
            dataKey="amount" 
            fill="#00C49F"
            label={{ 
              position: 'right',
              formatter: (value) => `$${value.toLocaleString()}`,
              fontSize: 12
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="h-96 mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={paidExpenses}
            dataKey="amount"
            nameKey="category"
            cx="46%"
            cy="50%"
            outerRadius={130}
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              value,
              index
            }) => {
              const RADIAN = Math.PI / 180;
              const radius = 25 + innerRadius + (outerRadius - innerRadius);
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              return (
                <text
                  x={x}
                  y={y}
                  fill="#000"
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  fontSize={12}
                >
                  {`${paidExpenses[index].category} ($${value.toLocaleString()})`}
                </text>
              );
            }}
          >
            {paidExpenses.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
          <Legend 
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            wrapperStyle={{ 
              fontSize: '12px',
              paddingTop: '30px'
            }}
          />
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
