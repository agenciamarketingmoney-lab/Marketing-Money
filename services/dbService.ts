
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc,
  setDoc,
  query, 
  where, 
  serverTimestamp,
  orderBy,
  limit,
  updateDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Company, Task, Campaign, DailyMetrics, User, UserRole } from "../types";

export const dbService = {
  // Usuários (Gestão de Perfil)
  async getUserProfile(uid: string): Promise<User | null> {
    if (!db) return null;
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      }
      return null;
    } catch (e) {
      console.error("Erro ao buscar perfil:", e);
      return null;
    }
  },

  async createUserProfile(user: User) {
    if (!db) return;
    try {
      await setDoc(doc(db, "users", user.id), {
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId || null,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Erro ao criar perfil no Firestore:", e);
    }
  },

  // Empresas / Clientes
  async addCompany(company: Omit<Company, 'id'>) {
    if (!db) throw new Error("Firestore não inicializado");
    const colRef = collection(db, "companies");
    const docRef = await addDoc(colRef, {
      ...company,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...company };
  },

  async getCompanies(): Promise<Company[]> {
    if (!db) return [];
    try {
      const colRef = collection(db, "companies");
      const q = query(colRef, orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Company[];
    } catch (e) {
      console.error("Erro ao buscar empresas:", e);
      return [];
    }
  },

  // Campanhas
  async getCampaigns(companyId?: string): Promise<Campaign[]> {
    if (!db) return [];
    try {
      const colRef = collection(db, "campaigns");
      const q = companyId && companyId !== 'all'
        ? query(colRef, where("companyId", "==", companyId))
        : query(colRef);
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];
    } catch (e) {
      console.error("Erro ao buscar campanhas:", e);
      return [];
    }
  },

  // Métricas de Performance
  async getMetrics(companyId?: string): Promise<DailyMetrics[]> {
    if (!db) return [];
    try {
      const colRef = collection(db, "metrics");
      let q;
      
      if (companyId && companyId !== 'all') {
        q = query(colRef, where("companyId", "==", companyId), orderBy("date", "asc"), limit(60));
      } else {
        q = query(colRef, orderBy("date", "asc"), limit(100));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as DailyMetrics);
    } catch (e) {
      console.error("Erro ao buscar métricas:", e);
      return [];
    }
  },

  // Tarefas / Projetos
  async getTasks(companyId?: string): Promise<Task[]> {
    if (!db) return [];
    try {
      const colRef = collection(db, "tasks");
      const q = companyId && companyId !== 'all'
        ? query(colRef, where("companyId", "==", companyId), orderBy("dueDate", "asc"))
        : query(colRef, orderBy("dueDate", "asc"));
        
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (e) {
      console.error("Erro ao buscar tarefas:", e);
      return [];
    }
  },

  async addTask(task: Omit<Task, 'id'>) {
    if (!db) throw new Error("Firestore indisponível");
    const colRef = collection(db, "tasks");
    const docRef = await addDoc(colRef, {
      ...task,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...task };
  }
};
