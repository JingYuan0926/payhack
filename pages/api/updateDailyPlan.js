import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
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

    // Calculate days remaining
    const daysRemaining = (new Date(userPlan.targetDate) - new Date()) / (1000 * 60 * 60 * 24);
    
    // Calculate additional daily savings needed
    const additionalDailyAmount = overspentAmount / daysRemaining;

    // Increase daily savings
    if (typeof userPlan.dailySavings === 'object') {
      userPlan.dailySavings.min += additionalDailyAmount;
      userPlan.dailySavings.max += additionalDailyAmount;
    } else {
      userPlan.dailySavings += additionalDailyAmount;
    }

    // Update remaining daily amount (will be less due to increased savings)
    if (typeof userPlan.remainingDaily === 'object') {
      userPlan.remainingDaily.min = userPlan.dailyLimit - userPlan.dailySavings.max;
      userPlan.remainingDaily.max = userPlan.dailyLimit - userPlan.dailySavings.min;
    } else {
      userPlan.remainingDaily = userPlan.dailyLimit - userPlan.dailySavings;
    }

    // Save the updated plan
    dailyData[username] = userPlan;
    fs.writeFileSync(dailyPath, JSON.stringify(dailyData, null, 2));

    res.status(200).json({ 
      message: 'Plan updated successfully',
      daysToGoal: daysRemaining,
      additionalDailyAmount
    });
  } catch (error) {
    console.error('Error updating daily plan:', error);
    res.status(500).json({ message: 'Error updating plan' });
  }
} 