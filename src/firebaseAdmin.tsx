// src/firebaseAdmin.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const adminFirebaseConfig = {
  apiKey: "AIzaSyA8Y248o-ANb9zn1cC2Os-4BEsZmC-J9Gc",
  authDomain: "studifocus-admin.firebaseapp.com",
  projectId: "studifocus-admin",
  storageBucket: "studifocus-admin.firebasestorage.app",
  messagingSenderId: "696235594398",
  appId: "1:696235594398:web:a7f9f68891c429c3b2618f"
};

// Initialize Firebase only once
const adminApp = !getApps().length ? initializeApp(adminFirebaseConfig) : getApp();

export const adminAuth = getAuth(adminApp);
