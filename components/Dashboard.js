import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { Card, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = ({ data = {} }) => {
  // Extracting data from props with default empty values to avoid undefined errors
  const { expenses = [], payments = [], expense_aging = [], budget = [] } = data;

  // Preparing Data for Charts
  const unpaidInvoicesData = {
    labels: expenses.filter((expense) => expense.status === 'Unpaid').map((expense) => expense.category),
    datasets: [
      {
        label: 'Unpaid Amount',
        data: expenses.filter((expense) => expense.status === 'Unpaid').map((expense) => expense.amount),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const paidInvoicesData = {
    labels: expenses.filter((expense) => expense.status === 'Paid').map((expense) => expense.category),
    datasets: [
      {
        label: 'Paid Amount',
        data: expenses.filter((expense) => expense.status === 'Paid').map((expense) => expense.amount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const pieData = {
    labels: expense_aging.map((aging) => aging.category),
    datasets: [
      {
        data: expense_aging.map((aging) => aging.total_amount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  };

  // Table Data Preparation
  const renderExpenseTableRows = () => {
    return expenses.map((expense) => (
      <tr key={expense.expense_id}>
        <td>{expense.expense_id}</td>
        <td>{expense.category}</td>
        <td>{expense.date}</td>
        <td>{expense.due_date}</td>
        <td>{expense.amount}</td>
        <td>{expense.status}</td>
        <td>{expense.payment_date || '-'}</td>
        <td>{expense.overdue_days}</td>
        <td>{expense.description}</td>
      </tr>
    ));
  };

  return (
    <div className="dashboard bg-gray-100 p-5">
      <h2>Financial Report</h2>
      <Card className="mb-4">
        <Card.Body>
          <h3>Unpaid Expenses</h3>
          <div className="flex">
          <Bar
  data={unpaidInvoicesData}
  options={{
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  }}
/>

<Pie data={unpaidInvoicesData} />
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <h3>Paid Expenses</h3>
          <Bar data={paidInvoicesData} />
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <h3>Expense Aging Summary</h3>
          <Pie data={pieData} />
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <h3>Expenses Table</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Expense ID</th>
                <th>Category</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Date</th>
                <th>Overdue Days</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>{renderExpenseTableRows()}</tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;
