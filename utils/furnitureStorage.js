import fs from 'fs';
import path from 'path';

const furniturePath = path.join(process.cwd(), 'data', 'furniture.json');

const defaultData = {
  placedFurniture: []
};

export const getFurniture = () => {
  try {
    if (!fs.existsSync(furniturePath)) {
      fs.writeFileSync(furniturePath, JSON.stringify(defaultData, null, 2));
      return defaultData.placedFurniture;
    }
    
    const data = fs.readFileSync(furniturePath, 'utf8');
    return JSON.parse(data).placedFurniture;
  } catch (error) {
    console.error('Error reading furniture data:', error);
    return [];
  }
};

export const saveFurniture = (furniture) => {
  try {
    fs.writeFileSync(
      furniturePath,
      JSON.stringify({ placedFurniture: furniture }, null, 2)
    );
    return true;
  } catch (error) {
    console.error('Error saving furniture:', error);
    return false;
  }
}; 