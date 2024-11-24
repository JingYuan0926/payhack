import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = req.body;
    
    // Ensure financialGoal is included in dailyGoals
    data.dailyGoals.financialGoal = data.financialPlan.financialGoal;

    const financialPlansPath = path.join(process.cwd(), 'data', 'financialPlans.json');
    const dailyGoalsPath = path.join(process.cwd(), 'data', 'dailyGoals.json');

    // Create directory if it doesn't exist
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    // Save Financial Plans
    let existingPlans = [];
    if (fs.existsSync(financialPlansPath)) {
      const fileContent = fs.readFileSync(financialPlansPath, 'utf8');
      existingPlans = JSON.parse(fileContent);
    }
    existingPlans.push(data.financialPlan);
    fs.writeFileSync(financialPlansPath, JSON.stringify(existingPlans, null, 2));

    // Save Daily Goals
    let existingGoals = [];
    if (fs.existsSync(dailyGoalsPath)) {
      const fileContent = fs.readFileSync(dailyGoalsPath, 'utf8');
      existingGoals = JSON.parse(fileContent);
    }
    existingGoals.push(data.dailyGoals);
    fs.writeFileSync(dailyGoalsPath, JSON.stringify(existingGoals, null, 2));

    res.status(200).json({ message: 'Financial plan and daily goals saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ message: 'Error saving data' });
  }
} 