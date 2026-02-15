
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { dbService } from "./dbService";
import { UserRole } from "../types";

type AuthCallback = (user: any | null) => void;
let activeCallback: AuthCallback | null = null;

export const authService = {
  async login(email: string, pass: string) {
    if (!auth) throw new Error("Serviço de autenticação não inicializado.");
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    
    // Verifica se já existe perfil, se não, cria um básico (fallback)
    const profile = await dbService.getUserProfile(user.uid);
    if (!profile) {
      await dbService.createUserProfile({
        id: user.uid,
        name: user.displayName || email.split('@')[0],
        email: user.email || '',
        role: UserRole.CLIENT // Padrão seguro para auto-cadastro
      });
    }
    return user;
  },

  async signUp(email: string, pass: string, name: string) {
    if (!auth) throw new Error("Serviço de autenticação não inicializado.");
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: name });

    // Lógica crucial: Verifica se o Admin já criou um perfil "pending" para este e-mail
    const existingUsers = await dbService.getAllUsers();
    const pendingProfile = existingUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id.startsWith('pending_'));

    if (pendingProfile) {
      // Migra os dados do perfil pendente para o novo UID real
      await dbService.createUserProfile({
        ...pendingProfile,
        id: user.uid,
        name: name
      });
      // Opcional: deletar o pendente (simplificado aqui mantendo os dois ou sobrescrevendo)
    } else {
      // Cria perfil novo do zero
      await dbService.createUserProfile({
        id: user.uid,
        name: name,
        email: email,
        role: UserRole.CLIENT 
      });
    }
    return user;
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
