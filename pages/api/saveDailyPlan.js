import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'daily.json');
    const planData = req.body;

    // Read existing data
    let existingData = {};
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      existingData = JSON.parse(fileContent);
    }

    // Add new plan
    existingData[planData.username] = {
      ...planData,
      createdAt: new Date().toISOString()
    };

    // Save updated data
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    res.status(200).json({ message: 'Plan saved successfully' });
  } catch (error) {
    console.error('Error saving plan:', error);
    res.status(500).json({ message: 'Error saving plan' });
  }
}