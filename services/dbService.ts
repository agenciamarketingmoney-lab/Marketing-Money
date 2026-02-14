
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
      const colRef = collection(db, "companies");
      const docRef = await addDoc(colRef, {
        ...company,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...company };
    } catch (e: any) {
      console.error("Firestore addCompany Error: ", e);
      throw e;
    }
  },

  async getCompanies(): Promise<Company[]> {
    try {
      const q = query(collection(db, "companies"), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return [];
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Company[];
    } catch (e) {
      console.error("Firestore getCompanies Error: ", e);
      // Se a API estiver desativada, retornamos uma lista vazia em vez de travar
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
    try {
      const docRef = await addDoc(collection(db, "tasks"), {
        ...task,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...task };
    } catch (e) {
      console.error("Erro ao adicionar tarefa:", e);
      throw e;
    }
  }
};
