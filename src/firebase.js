// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCYb889mfPmBrwcv2JCXVKdnr_9t2lPMDM",
  authDomain: "ilmiconnect-9241d.firebaseapp.com",
  projectId: "ilmiconnect-9241d",
  storageBucket: "ilmiconnect-9241d.firebasestorage.app",
  messagingSenderId: "80945875567",
  appId: "1:80945875567:web:74818b699636451016db9a",
  measurementId: "G-4TZJ3Z2T31"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Auth
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);

// Firestore
export const db = getFirestore(app);

// Storage
export const storage = getStorage(app);

// Admin email
export const ADMIN_EMAIL = "hirzia63@gmail.com";
