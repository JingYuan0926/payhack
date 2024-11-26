import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA6Oyr0hziIec9DRxwMwjYxkk4O34yEEXU",
  authDomain: "test-cb7a8.firebaseapp.com",
  projectId: "test-cb7a8",
  storageBucket: "test-cb7a8.firebasestorage.app",
  messagingSenderId: "813696719683",
  appId: "1:813696719683:web:44d235a48fd221acce6df6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 