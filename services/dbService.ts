
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Company, Task, Campaign, DailyMetrics } from "../types";

// Chaves para o LocalStorage (Fallback)
const LS_COMPANIES = 'nexus_local_companies';

export const dbService = {
  // Empresas / Clientes
  async addCompany(company: Omit<Company, 'id'>) {
    // Se o DB não inicializou, vai direto pro local
    if (!db) {
      console.warn("Nexus: Banco de dados não disponível. Salvando localmente...");
      const localData = JSON.parse(localStorage.getItem(LS_COMPANIES) || '[]');
      const newLocal = { ...company, id: 'local_' + Date.now() };
      localData.push(newLocal);
      localStorage.setItem(LS_COMPANIES, JSON.stringify(localData));
      return newLocal;
    }

    try {
      const colRef = collection(db, "companies");
      const docRef = await addDoc(colRef, {
        ...company,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...company };
    } catch (e: any) {
      console.warn("Firestore recusou salvamento, usando local...", e);
      
      const localData = JSON.parse(localStorage.getItem(LS_COMPANIES) || '[]');
      const newLocal = { ...company, id: 'local_' + Date.now() };
      localData.push(newLocal);
      localStorage.setItem(LS_COMPANIES, JSON.stringify(localData));
      
      if (e.message?.includes("API has not been used") || e.message?.includes("permission-denied")) {
        throw e;
      }
      return newLocal;
    }
  },

  async getCompanies(): Promise<Company[]> {
    if (!db) {
      return JSON.parse(localStorage.getItem(LS_COMPANIES) || '[]');
    }

    try {
      const colRef = collection(db, "companies");
      const q = query(colRef, orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      
      const firestoreData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Company[];

      const localData = JSON.parse(localStorage.getItem(LS_COMPANIES) || '[]');
      return [...firestoreData, ...localData];
    } catch (e) {
      return JSON.parse(localStorage.getItem(LS_COMPANIES) || '[]');
    }
  },

  // Campanhas
  async getCampaigns(companyId?: string): Promise<Campaign[]> {
    if (!db) return [];
    try {
      const colRef = collection(db, "campaigns");
      const q = companyId 
        ? query(colRef, where("companyId", "==", companyId))
        : query(colRef);
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];
    } catch (e) {
      return [];
    }
  },

  // Métricas
  async getMetrics(companyId?: string): Promise<DailyMetrics[]> {
    if (!db) {
      return this.getMockMetrics();
    }

    try {
      const colRef = collection(db, "metrics");
      const q = companyId 
        ? query(colRef, where("companyId", "==", companyId), orderBy("date", "desc"), limit(30))
        : query(colRef, orderBy("date", "desc"), limit(100));
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data() as DailyMetrics);
      return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (e) {
      return this.getMockMetrics();
    }
  },

  getMockMetrics(): DailyMetrics[] {
    return Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      spend: 100 + Math.random() * 50,
      impressions: 5000,
      clicks: 250,
      leads: 12,
      conversions: 2,
      revenue: 600
    })).reverse();
  },

  // Tarefas / Projetos
  async getTasks(companyId?: string): Promise<Task[]> {
    if (!db) return [];
    try {
      const colRef = collection(db, "tasks");
      const q = companyId 
        ? query(colRef, where("companyId", "==", companyId))
        : query(colRef);
        
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (e) {
      return [];
    }
  },

  async addTask(task: Omit<Task, 'id'>) {
    if (!db) throw new Error("Database unavailable");
    try {
      const colRef = collection(db, "tasks");
      const docRef = await addDoc(colRef, {
        ...task,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...task };
    } catch (e) {
      console.error("Erro ao adicionar task no Firestore:", e);
      throw e;
    }
  }
};
