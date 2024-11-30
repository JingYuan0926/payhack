import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'daily.json');
    
    if (!fs.existsSync(filePath)) {
      return res.status(200).json({ plan: null });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    // For now, we're just getting Tom The Cat's plan
    const plan = data['Tom The Cat'];

    res.status(200).json({ plan });
  } catch (error) {
    console.error('Error reading daily plan:', error);
    res.status(500).json({ message: 'Error reading daily plan' });
  }
} 