
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { dbService } from "./dbService";
import { UserRole } from "../types";

type AuthCallback = (user: any | null) => void;
let bypassUser: any | null = null;
let activeCallback: AuthCallback | null = null;

export const authService = {
  async login(email: string, pass: string) {
    // Bypass para demonstração rápida (Alexandre)
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

    if (!auth) throw new Error("Serviço de autenticação não inicializado.");

    try {
      bypassUser = null;
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;

      // Sincroniza perfil no Firestore
      const profile = await dbService.getUserProfile(user.uid);
      if (!profile) {
        await dbService.createUserProfile({
          id: user.uid,
          name: user.displayName || email.split('@')[0],
          email: user.email || '',
          role: UserRole.TEAM // Padrão para novos cadastros via login
        });
      }

      return user;
    } catch (error: any) {
      console.error("Erro no login Firebase:", error.code);
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
      unsubscribeFirebase = onAuthStateChanged(auth, async (user) => {
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
