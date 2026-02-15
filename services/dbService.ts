
import { 
  collection, 
  getDocs, 
  getDoc,
  doc,
  setDoc,
  query, 
  where, 
  serverTimestamp,
  orderBy,
  limit,
  writeBatch
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Company, Task, Campaign, DailyMetrics, User, UserRole } from "../types";
import { MOCK_COMPANIES, MOCK_CAMPAIGNS, MOCK_METRICS, MOCK_TASKS } from "./mockData";

export const dbService = {
  async seedDatabase() {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Você precisa estar logado para popular o banco.");
    const batch = writeBatch(db);
    try {
      for (const comp of MOCK_COMPANIES) {
        batch.set(doc(db, "companies", comp.id), { ...comp, createdAt: serverTimestamp() });
      }
      for (const camp of MOCK_CAMPAIGNS) {
        batch.set(doc(db, "campaigns", camp.id), { ...camp, createdAt: serverTimestamp() });
      }
      for (const met of MOCK_METRICS) {
        batch.set(doc(db, "metrics", `met_${met.date}_c1`), { ...met, companyId: 'c1', campaignId: 'cp1' });
      }
      for (const task of MOCK_TASKS) {
        batch.set(doc(db, "tasks", task.id), { ...task, createdAt: serverTimestamp() });
      }
      batch.set(doc(db, "users", currentUser.uid), {
        name: currentUser.displayName || 'Admin Nexus',
        email: currentUser.email,
        role: UserRole.ADMIN,
        updatedAt: serverTimestamp()
      });
      await batch.commit();
      return true;
    } catch (e) { throw e; }
  },

  async getUserProfile(uid: string): Promise<User | null> {
    const docSnap = await getDoc(doc(db, "users", uid));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as User : null;
  },

  async createUserProfile(user: User) {
    await setDoc(doc(db, "users", user.id), { ...user, updatedAt: serverTimestamp() });
  },

  // GESTÃO DE USUÁRIOS
  async getAllUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
  },

  async updateUserRole(uid: string, role: UserRole, companyId?: string) {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, { role, companyId: companyId || null }, { merge: true });
  },

  // ADIÇÃO DE DADOS
  // Adiciona uma nova empresa ao Firestore com ID gerado automaticamente
  async addCompany(company: Omit<Company, 'id'>) {
    const colRef = collection(db, "companies");
    const newDocRef = doc(colRef);
    await setDoc(newDocRef, { ...company, id: newDocRef.id, createdAt: serverTimestamp() });
  },

  // Adiciona uma nova tarefa ao Firestore com ID gerado automaticamente
  async addTask(task: Omit<Task, 'id'>) {
    const colRef = collection(db, "tasks");
    const newDocRef = doc(colRef);
    await setDoc(newDocRef, { ...task, id: newDocRef.id, createdAt: serverTimestamp() });
  },

  // CONSULTAS COM CONTEXTO DE SEGURANÇA
  async getCompanies(user?: User): Promise<Company[]> {
    const colRef = collection(db, "companies");
    // Se for CLIENT, retorna apenas a empresa dele
    if (user?.role === UserRole.CLIENT && user.companyId) {
      const q = query(colRef, where("__name__", "==", user.companyId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Company[];
    }
    const querySnapshot = await getDocs(colRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Company[];
  },

  async getCampaigns(companyId?: string): Promise<Campaign[]> {
    const colRef = collection(db, "campaigns");
    const q = companyId && companyId !== 'all' ? query(colRef, where("companyId", "==", companyId)) : query(colRef);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Campaign[];
  },

  async getMetrics(companyId?: string): Promise<DailyMetrics[]> {
    const colRef = collection(db, "metrics");
    const q = companyId && companyId !== 'all' ? query(colRef, where("companyId", "==", companyId), limit(60)) : query(colRef, limit(100));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as DailyMetrics);
  },

  async getTasks(companyId?: string): Promise<Task[]> {
    const colRef = collection(db, "tasks");
    const q = companyId && companyId !== 'all' ? query(colRef, where("companyId", "==", companyId)) : query(colRef);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
  }
};
