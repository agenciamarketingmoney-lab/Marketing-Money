
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAGiddLIYXwso7GCbykvyom3nhmZ0cCWfU",
  authDomain: "marketing-money.firebaseapp.com",
  projectId: "marketing-money",
  storageBucket: "marketing-money.firebasestorage.app",
  messagingSenderId: "449434193349",
  appId: "1:449434193349:web:443d7a67287b8bd5c8cfac",
  measurementId: "G-TS5K8YP6T8"
};

// Inicialização direta para garantir que erros de config apareçam no console
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
