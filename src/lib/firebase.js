import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDHmBaTxE9VugVPvwx7YZk9_t0_x6UXmyg",
  authDomain: "ai-teaching-assistant-da523.firebaseapp.com",
  projectId: "ai-teaching-assistant-da523",
  storageBucket: "ai-teaching-assistant-da523.firebasestorage.app",
  messagingSenderId: "873777613820",
  appId: "1:873777613820:web:b3d8f35c1429f7b448c079"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, signInAnonymously };
