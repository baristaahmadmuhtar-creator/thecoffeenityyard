import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
import { getAuth } from "firebase/auth"; 
import { getStorage } from "firebase/storage";

// Pastikan variabel lingkungan (environment variables) diatur dengan benar di file .env Anda
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID 
};

// Inisiasi Aplikasi Utama
const app = initializeApp(firebaseConfig);

// Inisiasi Layanan yang dibutuhkan
const db = getFirestore(app); // Firestore Database
const auth = getAuth(app); // Firebase Authentication
const storage = getStorage(app); // Firebase Storage

export default app;
export { db, auth, storage }; // EKSPORT db, auth, dan storage