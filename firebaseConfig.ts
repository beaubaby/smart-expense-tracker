
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: (process.env as any).VITE_FIREBASE_API_KEY || "",
  authDomain: (process.env as any).VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: (process.env as any).VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: (process.env as any).VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: (process.env as any).VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: (process.env as any).VITE_FIREBASE_APP_ID || ""
};

// Check if project ID is missing to avoid "projects/undefined" error
const isConfigValid = !!firebaseConfig.projectId && !!firebaseConfig.apiKey;

let dbInstance: Firestore | null = null;
let appInstance: FirebaseApp | null = null;

if (isConfigValid) {
  try {
    appInstance = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    dbInstance = getFirestore(appInstance);
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
} else {
  console.warn(
    "Firebase configuration is incomplete. Cloud sync will be disabled until environment variables are configured."
  );
}

export const db = dbInstance as Firestore;
export { isConfigValid };
