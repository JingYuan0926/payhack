import { getFurniture, saveFurniture } from '../../utils/furnitureStorage';

export default function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const furniture = getFurniture();
      res.status(200).json(furniture);
    } else if (req.method === 'POST') {
      const furniture = req.body;
      const success = saveFurniture(furniture);
      
      if (success) {
        res.status(200).json({ success: true });
      } else {
        res.status(500).json({ success: false, error: 'Failed to save furniture' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 