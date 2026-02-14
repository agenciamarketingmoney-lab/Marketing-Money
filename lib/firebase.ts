
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configurações reais do projeto marketing-money fornecidas pelo usuário
const firebaseConfig = {
  apiKey: "AIzaSyAGiddLIYXwso7GCbykvyom3nhmZ0cCWfU",
  authDomain: "marketing-money.firebaseapp.com",
  projectId: "marketing-money",
  storageBucket: "marketing-money.firebasestorage.app",
  messagingSenderId: "449434193349",
  appId: "1:449434193349:web:443d7a67287b8bd5c8cfac",
  measurementId: "G-TS5K8YP6T8"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços para uso em toda a aplicação
export const db = getFirestore(app);
export const auth = getAuth(app);
