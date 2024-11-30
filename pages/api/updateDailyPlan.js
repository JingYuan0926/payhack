import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { overspentAmount, username } = req.body;
    
    // Read the current daily.json
    const dailyPath = path.join(process.cwd(), 'data', 'daily.json');
    const dailyData = JSON.parse(fs.readFileSync(dailyPath, 'utf8'));
    
    const userPlan = dailyData[username];
    if (!userPlan) {
      return res.status(404).json({ message: 'User plan not found' });
    }

    // Recalculate the plan with the overspent amount
    const daysRemaining = (new Date(userPlan.targetDate) - new Date()) / (1000 * 60 * 60 * 24);
    const additionalDailyAmount = overspentAmount / daysRemaining;

    // Update the daily savings ranges
    userPlan.dailySavings = {
      min: userPlan.dailySavings.min + (additionalDailyAmount * 0.8),
      max: userPlan.dailySavings.max + additionalDailyAmount
    };

    // Update remaining daily amounts
    userPlan.remainingDaily = {
      min: userPlan.dailyLimit - userPlan.dailySavings.max,
      max: userPlan.dailyLimit - userPlan.dailySavings.min
    };

    // Save the updated plan
    dailyData[username] = userPlan;
    fs.writeFileSync(dailyPath, JSON.stringify(dailyData, null, 2));

    res.status(200).json({ message: 'Plan updated successfully' });
  } catch (error) {
    console.error('Error updating daily plan:', error);
    res.status(500).json({ message: 'Error updating plan' });
  }
} 