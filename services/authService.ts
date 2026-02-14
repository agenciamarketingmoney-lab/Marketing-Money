
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from "firebase/auth";
import { auth } from "../lib/firebase";

// Tipo estendido para suportar usuários simulados
type AuthCallback = (user: any | null) => void;
let bypassUser: any | null = null;
let activeCallback: AuthCallback | null = null;

export const authService = {
  // Login com e-mail e senha
  async login(email: string, pass: string) {
    // Lógica de Bypass para Testes Imediatos
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

    try {
      bypassUser = null;
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      return userCredential.user;
    } catch (error: any) {
      console.error("Erro no login:", error.code);
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      bypassUser = null;
      await signOut(auth);
      if (activeCallback) activeCallback(null);
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  },

  // Escutar mudanças no estado do usuário (Firebase + Bypass)
  subscribeToAuthChanges(callback: AuthCallback) {
    activeCallback = callback;
    
    // Escuta do Firebase
    const unsubscribeFirebase = onAuthStateChanged(auth, (user) => {
      if (!bypassUser) {
        callback(user);
      }
    });

    // Se já houver um bypass ativo, notifica imediatamente
    if (bypassUser) callback(bypassUser);

    return () => {
      unsubscribeFirebase();
      activeCallback = null;
    };
  }
};
