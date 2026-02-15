
import { initializeApp, getApps, getApp } from "firebase/app";
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

// Singleton pattern
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db: Firestore | null = (() => {
  try {
    return getFirestore(app);
  } catch (e) {
    console.error("Nexus DB: Erro ao inicializar Firestore. Verifique se o serviço está ativo no painel Firebase.", e);
    return null;
  }
})();

export const auth: Auth | null = (() => {
  try {
    return getAuth(app);
  } catch (e) {
    console.error("Nexus Auth: Erro ao inicializar serviço de autenticação.", e);
    return null;
  }
})();
