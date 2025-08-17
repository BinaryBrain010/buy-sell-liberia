import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDemo-API-Key-Replace-With-Your-Own",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "buysell-liberia-demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "buysell-liberia-demo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "buysell-liberia-demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890abcdef",
}

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Auth
export const auth = getAuth(app)

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Storage
export const storage = getStorage(app)

// For development/demo purposes, you can use the Firebase emulator
// Uncomment these lines if you want to use the Firebase emulator locally
// if (typeof window !== 'undefined' && !auth.config.emulator) {
//   connectAuthEmulator(auth, "http://localhost:9099")
//   connectFirestoreEmulator(db, "localhost", 8080)
// }

export default app
