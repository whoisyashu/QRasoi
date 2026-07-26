import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCw0rq0iB8obMbB62ABErlJc4D_zU3rxeI",
  authDomain: "qrasoi-d016b.firebaseapp.com",
  projectId: "qrasoi-d016b",
  storageBucket: "qrasoi-d016b.firebasestorage.app",
  messagingSenderId: "861985071843",
  appId: "1:861985071843:web:6d27f4777111335b33dbd6",
  measurementId: "G-TEM4ZR348M"
};

export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const firebaseAuth = getAuth(firebaseApp);
