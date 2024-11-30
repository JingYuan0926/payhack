import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const FURNITURE_DOC_ID = 'furniture_data';

export const getFurniture = async () => {
  try {
    const docRef = doc(db, 'furniture', FURNITURE_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().placedFurniture;
    } else {
      await setDoc(docRef, { placedFurniture: [] });
      return [];
    }
  } catch (error) {
    console.error('Error reading furniture data:', error);
    return [];
  }
};

export const subscribeFurniture = (callback) => {
  const docRef = doc(db, 'furniture', FURNITURE_DOC_ID);
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().placedFurniture);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error('Error subscribing to furniture updates:', error);
  });
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