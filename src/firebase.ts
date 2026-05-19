import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from './firebase-applet-config.json';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBv1P2gFYGXnvOVfF77uBzNhRtkNSvdWVs",
  authDomain: "studifocus.firebaseapp.com",
  projectId: "studifocus",
  storageBucket: "studifocus.firebasestorage.app",
  messagingSenderId: "47542945004",
  appId: "1:47542945004:web:1528b23dc4b032507b11c9",
};

// Initialize Firebase app (only once)
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);


// Enforce local persistence so users stay logged in across sessions
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});

export default app;