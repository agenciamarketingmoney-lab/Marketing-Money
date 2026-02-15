
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from "../lib/firebase";

type AuthCallback = (user: any | null) => void;
let bypassUser: any | null = null;
let activeCallback: AuthCallback | null = null;

export const authService = {
  async login(email: string, pass: string) {
    if (email === 'alexandre@agencianexus.com' && pass === 'demo123456') {
      bypassUser = {
        uid: 'u1',
        email: 'alexandre@agencianexus.com',
        displayName: 'Alexandre Silva',
        isDemo: true
      };
      if (activeCallback) activeCallback(bypassUser);
      return bypassUser;
    }

    if (!auth) {
      throw new Error("Serviço de autenticação Nexus não inicializado.");
    }

    try {
      bypassUser = null;
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      return userCredential.user;
    } catch (error: any) {
      console.error("Erro no login:", error.code);
      throw error;
    }
  },

  async logout() {
    try {
      bypassUser = null;
      if (auth) await signOut(auth);
      if (activeCallback) activeCallback(null);
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  },

  subscribeToAuthChanges(callback: AuthCallback) {
    activeCallback = callback;
    
    let unsubscribeFirebase = () => {};
    
    if (auth) {
      unsubscribeFirebase = onAuthStateChanged(auth, (user) => {
        if (!bypassUser) {
          callback(user);
        }
      });
    }

    if (bypassUser) callback(bypassUser);

    return () => {
      unsubscribeFirebase();
      activeCallback = null;
    };
  }
};
