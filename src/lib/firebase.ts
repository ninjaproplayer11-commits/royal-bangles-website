import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// YOUR FIREBASE CONFIG - REPLACE THIS WITH YOUR DETAILS FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyD3cuCEkcrdPjfYiL-9EM4dmrrFfrKUYaA",
  authDomain: "store-64f33.firebaseapp.com",
  projectId: "store-64f33",
  storageBucket: "store-64f33.firebasestorage.app",
  messagingSenderId: "1024439546277",
  appId: "1:1024439546277:web:a1abba5cf67bae0329784c",
  measurementId: "G-L23BVJ7XVY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
