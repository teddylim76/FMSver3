// src/firebase.ts
// Firebase 초기화 설정 - FMSver3 프로젝트

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAC_Hbm4sRQ6t3E5XoOgYSkrShxKW6uPrM",
  authDomain: "fmsver3.firebaseapp.com",
  databaseURL: "https://fmsver3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fmsver3",
  storageBucket: "fmsver3.firebasestorage.app",
  messagingSenderId: "57213170355",
  appId: "1:57213170355:web:47f279a4c635f63d25f6c6",
  measurementId: "G-7T522BJQN2",
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);   // Firestore Database
export const storage = getStorage(app);     // Firebase Storage
export const auth    = getAuth(app);        // Firebase Auth
export const analytics = getAnalytics(app); // Analytics

export default app;
