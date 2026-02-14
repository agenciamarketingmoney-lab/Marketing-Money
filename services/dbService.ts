
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Company, Task } from "../types";

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
      const querySnapshot = await getDocs(collection(db, "companies"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Company[];
    } catch (e) {
      console.error("Erro ao buscar empresas: ", e);
      return [];
    }
  },

  // Tarefas / Projetos
  async addTask(task: Omit<Task, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, "tasks"), {
        ...task,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...task };
    } catch (e) {
      console.error("Erro ao adicionar tarefa: ", e);
      throw e;
    }
  },

  async getTasks(): Promise<Task[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "tasks"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (e) {
      console.error("Erro ao buscar tarefas: ", e);
      return [];
    }
  }
};
