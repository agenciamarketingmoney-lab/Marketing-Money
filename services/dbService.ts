
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
  updateDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Company, Task, Campaign, DailyMetrics, User, UserRole } from "../types";
import { MOCK_COMPANIES, MOCK_CAMPAIGNS, MOCK_METRICS, MOCK_TASKS } from "./mockData";

export const dbService = {
  // Função para popular o banco do zero (Seed)
  async seedDatabase() {
    const batch = writeBatch(db);
    
    try {
      // 1. Criar Empresas
      for (const comp of MOCK_COMPANIES) {
        const ref = doc(db, "companies", comp.id);
        batch.set(ref, { ...comp, createdAt: serverTimestamp() });
      }

      // 2. Criar Campanhas
      for (const camp of MOCK_CAMPAIGNS) {
        const ref = doc(db, "campaigns", camp.id);
        batch.set(ref, { ...camp, createdAt: serverTimestamp() });
      }

      // 3. Criar Métricas (limitado a 30 dias para não estourar o batch)
      for (const met of MOCK_METRICS) {
        const id = `met_${met.date}_c1`;
        const ref = doc(db, "metrics", id);
        batch.set(ref, { ...met, companyId: 'c1' });
      }

      // 4. Criar Usuário Admin Base
      const adminRef = doc(db, "users", "u1");
      batch.set(adminRef, {
        name: 'Alexandre Silva',
        email: 'alexandre@agencianexus.com',
        role: 'ADMIN',
        updatedAt: serverTimestamp()
      });

      await batch.commit();
      console.log("Nexus: Banco de dados inicializado com sucesso!");
      return true;
    } catch (e) {
      console.error("Erro ao popular banco:", e);
      throw e;
    }
  },

  // Usuários (Gestão de Perfil)
  async getUserProfile(uid: string): Promise<User | null> {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      }
      return null;
    } catch (e) {
      console.error("Nexus DB Error [getUserProfile]:", e);
      return null;
    }
  },

  async createUserProfile(user: User) {
    try {
      await setDoc(doc(db, "users", user.id), {
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId || null,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Nexus DB Error [createUserProfile]:", e);
    }
  },

  // Empresas / Clientes
  async addCompany(company: Omit<Company, 'id'>) {
    try {
      const colRef = collection(db, "companies");
      const docRef = await addDoc(colRef, {
        ...company,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...company };
    } catch (e: any) {
      console.error("Nexus DB Error [addCompany]:", e.message);
      throw e;
    }
  },

  async getCompanies(): Promise<Company[]> {
    try {
      const colRef = collection(db, "companies");
      const querySnapshot = await getDocs(colRef);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Company[];
    } catch (e: any) {
      console.error("Nexus DB Error [getCompanies]:", e.message);
      return [];
    }
  },

  // Campanhas
  async getCampaigns(companyId?: string): Promise<Campaign[]> {
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
      console.error("Nexus DB Error [getCampaigns]:", e);
      return [];
    }
  },

  // Métricas de Performance
  async getMetrics(companyId?: string): Promise<DailyMetrics[]> {
    try {
      const colRef = collection(db, "metrics");
      let q;
      
      if (companyId && companyId !== 'all') {
        q = query(colRef, where("companyId", "==", companyId), limit(60));
      } else {
        q = query(colRef, limit(100));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as DailyMetrics);
    } catch (e) {
      console.error("Nexus DB Error [getMetrics]:", e);
      return [];
    }
  },

  // Tarefas / Projetos
  async getTasks(companyId?: string): Promise<Task[]> {
    try {
      const colRef = collection(db, "tasks");
      const q = companyId && companyId !== 'all'
        ? query(colRef, where("companyId", "==", companyId))
        : query(colRef);
        
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (e) {
      console.error("Nexus DB Error [getTasks]:", e);
      return [];
    }
  },

  async addTask(task: Omit<Task, 'id'>) {
    try {
      const colRef = collection(db, "tasks");
      const docRef = await addDoc(colRef, {
        ...task,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...task };
    } catch (e: any) {
      console.error("Nexus DB Error [addTask]:", e.message);
      throw e;
    }
  }
};
