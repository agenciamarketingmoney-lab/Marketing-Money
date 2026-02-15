
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { dbService } from "./dbService";
import { UserRole } from "../types";

type AuthCallback = (user: any | null) => void;
let activeCallback: AuthCallback | null = null;

export const authService = {
  async login(email: string, pass: string) {
    if (!auth) throw new Error("Serviço de autenticação não inicializado.");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;

      // Sincroniza perfil no Firestore
      const profile = await dbService.getUserProfile(user.uid);
      if (!profile) {
        // Se o usuário logou mas não tem perfil (ex: cadastrado direto no console), cria um perfil básico
        await dbService.createUserProfile({
          id: user.uid,
          name: user.displayName || email.split('@')[0],
          email: user.email || '',
          role: UserRole.TEAM 
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
        callback(user);
      });
    }

    return () => {
      unsubscribeFirebase();
      activeCallback = null;
    };
  }
};
