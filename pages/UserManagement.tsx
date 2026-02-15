
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  UserPlus, 
  Mail, 
  Loader2, 
  CheckCircle2, 
  X, 
  Plus, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { User, UserRole, Company } from '../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: UserRole.TEAM,
    companyId: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersList, compsList] = await Promise.all([
        dbService.getAllUsers(),
        dbService.getCompanies()
      ]);
      setUsers(usersList);
      setCompanies(compsList);
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Nota: Para criar no Firebase Auth realmente, precisaria de Cloud Functions.
      // Aqui criamos o perfil no Firestore. O usuário deve se cadastrar com o mesmo e-mail.
      await dbService.createUserProfile({
        id: `pending_${Date.now()}`, // ID temporário até o login real
        ...newUser
      });
      setIsModalOpen(false);
      await loadData();
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleUpdate = async (uid: string, role: UserRole, companyId?: string) => {
    setUpdatingId(uid);
    try {
      await dbService.updateUserRole(uid, role, companyId);
      await loadData();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Gestão de Equipe & Acessos</h2>
          <p className="text-sm text-gray-500">Controle de permissões e vinculação de clientes reais</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center space-x-2 transition-all shadow-lg shadow-indigo-600/20"
        >
          <UserPlus size={16} />
          <span>Novo Acesso</span>
        </button>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-800 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                <th className="px-8 py-6">Usuário</th>
                <th className="px-8 py-6">Cargo</th>
                <th className="px-8 py-6">Empresa Vinculada</th>
                <th className="px-8 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {users.length > 0 ? users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/20 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center">
                          {user.name}
                          {user.id.startsWith('pending') && (
                            <span className="ml-2 text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-black uppercase">Aguardando Login</span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleUpdate(user.id, e.target.value as UserRole, user.companyId)}
                      className="bg-gray-900 border border-gray-800 text-xs font-bold text-gray-300 px-3 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      {Object.values(UserRole).map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      disabled={user.role !== UserRole.CLIENT}
                      value={user.companyId || ''}
                      onChange={(e) => handleRoleUpdate(user.id, user.role, e.target.value)}
                      className="bg-gray-900 border border-gray-800 text-xs font-bold text-gray-300 px-3 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-30 cursor-pointer"
                    >
                      <option value="">Nenhuma (Equipe Interna)</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {updatingId === user.id ? (
                      <Loader2 size={18} className="animate-spin text-indigo-500 ml-auto" />
                    ) : (
                      <CheckCircle2 size={18} className="text-emerald-500 ml-auto opacity-0 group-hover:opacity-100" />
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-600 font-bold uppercase text-xs tracking-widest">
                    Nenhum usuário cadastrado além do administrador.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-800 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Novo Perfil de Acesso</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex items-start space-x-3 mb-4">
                <AlertCircle size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-indigo-300 leading-relaxed font-medium">
                  Este formulário cria o perfil de permissões. O usuário deverá realizar o cadastro no sistema usando exatamente este mesmo e-mail para ativar seu acesso.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Nome Completo</label>
                <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Ex: João Silva" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">E-mail Corporativo</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="exemplo@nexus.com" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Cargo</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3.5 text-sm text-white outline-none">
                    {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Empresa</label>
                  <select disabled={newUser.role !== UserRole.CLIENT} value={newUser.companyId} onChange={e => setNewUser({...newUser, companyId: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3.5 text-sm text-white outline-none disabled:opacity-30">
                    <option value="">Equipe Nexus</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <button disabled={isSaving} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center transition-all">
                {isSaving ? <Loader2 className="animate-spin mr-2" size={20} /> : "VINCULAR PERFIL"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
