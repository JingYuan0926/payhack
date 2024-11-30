import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const filePath = path.join(process.cwd(), 'data', 'daily.json');

  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    let existingData = {};

    // Check if the file exists and is not empty
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      if (fileContent) {
        existingData = JSON.parse(fileContent);
      }
    }

    // Add new plan
    const newPlan = req.body;
    existingData[newPlan.username] = {
      ...newPlan,
      createdAt: new Date().toISOString()
    };

    // Write updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    res.status(200).json({ message: 'Plan saved successfully' });
  } catch (error) {
    console.error('Error saving plan:', error);
    res.status(500).json({ message: 'Error saving plan', error: error.message });
  }
}