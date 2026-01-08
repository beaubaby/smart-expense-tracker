
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.VITE_FIREBASE_APP_ID || ""
};

// Check if critical configuration is missing
const isConfigValid = !!firebaseConfig.projectId && !!firebaseConfig.apiKey;

let dbInstance: Firestore | null = null;

if (isConfigValid) {
  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    dbInstance = getFirestore(app);
    console.log("Firebase initialized successfully.");
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
}

export const db = dbInstance;
export { isConfigValid };
