import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ExpenseDashboard = () => {
  const data = {
   "expenses": [
      {
        "expense_id": "EXP-001",
        "category": "Rent",
        "date": "2024-04-01",
        "due_date": "2024-05-01",
        "amount": 1500,
        "status": "Unpaid",
        "payment_date": null,
        "overdue_days": 30,
        "description": "Monthly apartment rent"
      },

      {
        "expense_id": "EXP-002",
        "category": "Groceries",
        "date": "2024-04-05",
        "due_date": "2024-04-05",
        "amount": 350,
        "status": "Paid",
        "payment_date": "2024-04-05",
        "overdue_days": 0,
        "description": "Weekly groceries shopping"
      },
      {
        "expense_id": "EXP-003",
        "category": "Utilities",
        "date": "2024-04-10",
        "due_date": "2024-05-01",
        "amount": 200,
        "status": "Unpaid",
        "payment_date": null,
        "overdue_days": 30,
        "description": "Electricity & water bill"
      },
      {
        "expense_id": "EXP-004",
        "category": "Transportation",
        "date": "2024-03-20",
        "due_date": "2024-04-01",
        "amount": 100,
        "status": "Unpaid",
        "payment_date": null,
        "overdue_days": 60,
        "description": "Monthly bus & train pass"
      },
      {
        "expense_id": "EXP-005",
        "category": "Health Insurance",
        "date": "2024-05-01",
        "due_date": "2024-06-01",
        "amount": 300,
        "status": "Unpaid",
        "payment_date": null,
        "overdue_days": 15,
        "description": "Monthly health insurance"
      },
      {
        "expense_id": "EXP-006",
        "category": "Internet & Phone",
        "date": "2024-04-15",
        "due_date": "2024-05-15",
        "amount": 75,
        "status": "Unpaid",
        "payment_date": null,
        "overdue_days": 20,
        "description": "Internet and mobile plan"
      },
      {
        "expense_id": "EXP-007",
        "category": "Dining Out",
        "date": "2024-04-20",
        "due_date": "2024-04-20",
        "amount": 120,
        "status": "Paid",
        "payment_date": "2024-04-20",
        "overdue_days": 0,
        "description": "Dinner with friends"
      },
      {
        "expense_id": "EXP-008",
        "category": "Gym Membership",
        "date": "2024-04-01",
        "due_date": "2024-05-01",
        "amount": 50,
        "status": "Paid",
        "payment_date": "2024-04-30",
        "overdue_days": 0,
        "description": "Monthly gym membership"
      },
      {
        "expense_id": "EXP-009",
        "category": "Entertainment",
        "date": "2024-05-10",
        "due_date": "2024-06-10",
        "amount": 100,
        "status": "Unpaid",
        "payment_date": null,
        "overdue_days": 15,
        "description": "Movie streaming subscription"
      },
      {
        "expense_id": "EXP-010",
        "category": "Credit Card Bill",
        "date": "2024-03-10",
        "due_date": "2024-04-10",
        "amount": 500,
        "status": "Unpaid",
        "payment_date": null,
        "overdue_days": 55,
        "description": "Monthly credit card payment"
      },
      {
        "expense_id": "EXP-011",
        "category": "Childcare",
        "date": "2024-04-05",
        "due_date": "2024-04-05",
        "amount": 400,
        "status": "Paid",
        "payment_date": "2024-04-05",
        "overdue_days": 0,
        "description": "Daycare expenses for children"
      },
      {
        "expense_id": "EXP-012",
        "category": "Travel",
        "date": "2024-04-15",
        "due_date": "2024-05-15",
        "amount": 800,
        "status": "Unpaid",
        "payment_date": null,
        "overdue_days": 20,
        "description": "Family trip expenses"
      },
      {
        "expense_id": "EXP-013",
        "category": "Subscriptions",
        "date": "2024-04-10",
        "due_date": "2024-05-10",
        "amount": 30,
        "status": "Unpaid",
        "payment_date": null,
        "overdue_days": 25,
        "description": "Monthly software subscription"
      },
      {
        "expense_id": "EXP-014",
        "category": "Personal Care",
        "date": "2024-04-20",
        "due_date": "2024-04-20",
        "amount": 60,
        "status": "Paid",
        "payment_date": "2024-04-20",
        "overdue_days": 0,
        "description": "Haircut and grooming"
      },
      {
        "expense_id": "EXP-015",
        "category": "Education",
        "date": "2024-04-01",
        "due_date": "2024-05-01",
        "amount": 1200,
        "status": "Unpaid",
        "payment_date": null,
        "overdue_days": 30,
        "description": "Online course payment"
      },
      {
        "expense_id": "EXP-016",
        "category": "Medical Expenses",
        "date": "2024-03-25",
        "due_date": "2024-04-25",
        "amount": 300,
        "status": "Unpaid",
        "payment_date": null,
        "overdue_days": 40,
        "description": "Doctor visit and prescription"
      },
      {
        "expense_id": "EXP-017",
        "category": "Clothing",
        "date": "2024-04-05",
        "due_date": "2024-04-05",
        "amount": 200,
        "status": "Paid",
        "payment_date": "2024-04-05",
        "overdue_days": 0,
        "description": "Spring clothing shopping"
      },
      {
        "expense_id": "EXP-018",
        "category": "Pet Care",
        "date": "2024-04-15",
        "due_date": "2024-04-20",
        "amount": 100,
        "status": "Paid",
        "payment_date": "2024-04-19",
        "overdue_days": 0,
        "description": "Pet food and grooming"
      },
      {
        "expense_id": "EXP-019",
        "category": "Home Maintenance",
        "date": "2024-05-01",
        "due_date": "2024-06-01",
        "amount": 250,
        "status": "Unpaid",
        "payment_date": null,
        "overdue_days": 15,
        "description": "Repairs and maintenance supplies"
      },
      {
        "expense_id": "EXP-020",
        "category": "Loan Payment",
        "date": "2024-03-10",
        "due_date": "2024-04-10",
        "amount": 600,
        "status": "Unpaid",
        "payment_date": null,
        "overdue_days": 55,
        "description": "Personal loan installment"
      },
      {
        "expense_id": "EXP-021",
        "category": "Fitness Equipment",
        "date": "2024-05-10",
        "due_date": "2024-06-10",
        "amount": 150,
        "status": "Unpaid",
        "payment_date": null,
        "overdue_days": 15,
        "description": "Purchase of home fitness equipment"
      },
      {
        "expense_id": "EXP-022",
        "category": "Gifts",
        "date": "2024-04-30",
        "due_date": "2024-05-15",
        "amount": 100,
        "status": "Paid",
        "payment_date": "2024-05-10",
        "overdue_days": 0,
        "description": "Birthday gift for a friend"
      },
      {
        "expense_id": "EXP-023",
        "category": "Charity Donation",
        "date": "2024-04-15",
        "due_date": "2024-04-15",
        "amount": 50,
        "status": "Paid",
        "payment_date": "2024-04-15",
        "overdue_days": 0,
        "description": "Donation to local charity"
      },
      {
        "expense_id": "EXP-024",
        "category": "Mortgage",
        "date": "2024-04-01",
        "due_date": "2024-05-01",
        "amount": 2000,
        "status": "Unpaid",
        "payment_date": null,
        "overdue_days": 30,
        "description": "Monthly mortgage payment"
      }
    ],

    "payments": [
    {
      "payment_id": "PAY-001",
      "expense_id": "EXP-002",
      "payment_amount": 350,
      "payment_method": "Credit Card",
      "payment_date": "2024-04-05"
    },
    {
      "payment_id": "PAY-002",
      "expense_id": "EXP-007",
      "payment_amount": 120,
      "payment_method": "Cash",
      "payment_date": "2024-04-20"
    },
    {
      "payment_id": "PAY-003",
      "expense_id": "EXP-008",
      "payment_amount": 50,
      "payment_method": "Bank Transfer",
      "payment_date": "2024-04-30"
    }
  ],
  "expense_aging": [
    {
      "category": "Rent",
      "current": 0,
      "one_30_days": 0,
      "thirtyone_60_days": 1500,
      "sixtyone_90_days": 0,
      "ninetyplus_days": 0,
      "total_amount": 1500
    },
    {
      "category": "Utilities",
      "current": 0,
      "one_30_days": 200,
      "thirtyone_60_days": 0,
      "sixtyone_90_days": 0,
      "ninetyplus_days": 0,
      "total_amount": 200
    },
    {
      "category": "Transportation",
      "current": 0,
      "one_30_days": 0,
      "thirtyone_60_days": 100,
      "sixtyone_90_days": 0,
      "ninetyplus_days": 0,
      "total_amount": 100
    },
    {
      "category": "Health Insurance",
      "current": 300,
      "one_30_days": 0,
      "thirtyone_60_days": 0,
      "sixtyone_90_days": 0,
      "ninetyplus_days": 0,
      "total_amount": 300
    },
    {
      "category": "Internet & Phone",
      "current": 0,
      "one_30_days": 75,
      "thirtyone_60_days": 0,
      "sixtyone_90_days": 0,
      "ninetyplus_days": 0,
      "total_amount": 75
    },
    {
      "category": "Credit Card Bill",
      "current": 0,
      "one_30_days": 0,
      "thirtyone_60_days": 0,
      "sixtyone_90_days": 500,
      "ninetyplus_days": 0,
      "total_amount": 500
    }
  ],
  "budget": [
    {
      "category": "Rent",
      "monthly_budget": 1500,
      "spent_amount": 1500,
      "remaining_budget": 0
    },
    {
      "category": "Groceries",
      "monthly_budget": 400,
      "spent_amount": 350,
      "remaining_budget": 50
    },
    {
      "category": "Utilities",
      "monthly_budget": 250,
      "spent_amount": 200,
      "remaining_budget": 50
    },
    {
      "category": "Transportation",
      "monthly_budget": 150,
      "spent_amount": 100,
      "remaining_budget": 50
    },
    {
      "category": "Health Insurance",
      "monthly_budget": 300,
      "spent_amount": 300,
      "remaining_budget": 0
    },
    {
      "category": "Internet & Phone",
      "monthly_budget": 100,
      "spent_amount": 75,
      "remaining_budget": 25
    }
  ]
  };

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
      <Card>
        <CardHeader>
          <CardTitle>Paid vs Unpaid Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="paid" fill="#00C49F" name="Paid" />
                <Bar dataKey="unpaid" fill="#FF8042" name="Unpaid" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Aging Details */}
      <Card>
        <CardHeader>
          <CardTitle>Aging Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Due Date</th>
                  <th className="p-2 text-left">Days Till Payment</th>
                </tr>
              </thead>
              <tbody>
                {agingDetails.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">{item.id}</td>
                    <td className="p-2">{item.category}</td>
                    <td className="p-2">${item.amount.toLocaleString()}</td>
                    <td className="p-2">{item.dueDate}</td>
                    <td className="p-2">{item.overdueDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Expense Details */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                {data.expenses.map((expense) => (
                  <tr key={expense.expense_id} className="border-b">
                    <td className="p-2">{expense.expense_id}</td>
                    <td className="p-2">{expense.category}</td>
                    <td className="p-2">${expense.amount.toLocaleString()}</td>
                    <td className="p-2">{expense.status}</td>
                    <td className="p-2">{expense.description}</td>
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
