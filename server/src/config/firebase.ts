import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCw0rq0iB8obMbB62ABErlJc4D_zU3rxeI",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "qrasoi-d016b.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "qrasoi-d016b",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "qrasoi-d016b.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "861985071843",
  appId: process.env.FIREBASE_APP_ID || "1:861985071843:web:6d27f4777111335b33dbd6",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-TEM4ZR348M"
};

export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const firebaseAuth = getAuth(firebaseApp);
