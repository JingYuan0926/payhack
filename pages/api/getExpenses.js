import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const expensesPath = path.join(process.cwd(), 'data', 'expenses.json');
    const expensesData = JSON.parse(fs.readFileSync(expensesPath, 'utf8'));
    res.status(200).json(expensesData);
  } catch (error) {
    console.error('Error reading expenses:', error);
    res.status(500).json({ error: 'Failed to load expenses data' });
  }
} 