import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(req, res) {
  try {
    // Get the path to the JSON file
    const jsonDirectory = path.join(process.cwd(), 'data');
    const fileContents = await fs.readFile(jsonDirectory + '/expenses.json', 'utf8');
    const data = JSON.parse(fileContents);
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error reading expenses:', error);
    res.status(500).json({ error: 'Failed to load expenses' });
  }
} 