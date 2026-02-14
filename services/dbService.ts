
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

export const dbService = {
  // Empresas / Clientes
  async addCompany(company: Omit<Company, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, "companies"), {
        ...company,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...company };
    } catch (e) {
      console.error("Erro ao adicionar empresa: ", e);
      throw e;
    }
  },

  async getCompanies(): Promise<Company[]> {
    try {
      const q = query(collection(db, "companies"), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Company[];
    } catch (e) {
      console.error("Erro ao buscar empresas: ", e);
      return [];
    }
  },

  // Campanhas
  async getCampaigns(companyId?: string): Promise<Campaign[]> {
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
      console.error("Erro ao buscar campanhas: ", e);
      return [];
    }
  },

  // Métricas
  async getMetrics(companyId?: string): Promise<DailyMetrics[]> {
    try {
      const colRef = collection(db, "metrics");
      const q = companyId 
        ? query(colRef, where("companyId", "==", companyId), orderBy("date", "desc"), limit(30))
        : query(colRef, orderBy("date", "desc"), limit(100));
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data() as DailyMetrics);
      // Re-ordenar para o gráfico (data ascendente)
      return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (e) {
      console.error("Erro ao buscar métricas: ", e);
      return [];
    }
  },

  // Tarefas / Projetos
  async getTasks(companyId?: string): Promise<Task[]> {
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
      console.error("Erro ao buscar tarefas: ", e);
      return [];
    }
  },

  async addTask(task: Omit<Task, 'id'>) {
    const docRef = await addDoc(collection(db, "tasks"), {
      ...task,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...task };
  }
};
