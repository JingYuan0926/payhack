import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const FURNITURE_DOC_ID = 'furniture_data';

export const getFurniture = async () => {
  try {
    const docRef = doc(db, 'furniture', FURNITURE_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().placedFurniture;
    } else {
      // Initialize with empty array if document doesn't exist
      await setDoc(docRef, { placedFurniture: [] });
      return [];
    }
  } catch (error) {
    console.error('Error reading furniture data:', error);
    return [];
  }
};

export const saveFurniture = async (furniture) => {
  try {
    const docRef = doc(db, 'furniture', FURNITURE_DOC_ID);
    await setDoc(docRef, { placedFurniture: furniture });
    return true;
  } catch (error) {
    console.error('Error saving furniture:', error);
    return false;
  }
}; 