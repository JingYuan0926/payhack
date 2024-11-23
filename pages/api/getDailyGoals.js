import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'dailyGoals.json');
    
    if (!fs.existsSync(filePath)) {
      return res.status(200).json({ goals: [] });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const goals = JSON.parse(fileContent);

    res.status(200).json({ goals });
  } catch (error) {
    console.error('Error reading daily goals:', error);
    res.status(500).json({ message: 'Error reading daily goals' });
  }
} 