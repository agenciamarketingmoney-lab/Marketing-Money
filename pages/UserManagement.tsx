
import React, { useState, useEffect } from 'react';
import { Shield, UserCog, Mail, Briefcase, ChevronRight, Loader2, Save, CheckCircle2 } from 'lucide-react';
import { dbService } from '../services/dbService';
import { User, UserRole, Company } from '../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [usersList, compsList] = await Promise.all([
      dbService.getAllUsers(),
      dbService.getCompanies()
    ]);
    setUsers(usersList);
    setCompanies(compsList);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

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
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Gestão de Equipe & Acessos</h2>
        <p className="text-sm text-gray-500">Controle de permissões e vinculação de clientes</p>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-800 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                <th className="px-8 py-6">Usuário</th>
                <th className="px-8 py-6">Cargo / Nível</th>
                <th className="px-8 py-6">Empresa Vinculada</th>
                <th className="px-8 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/20 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{user.name}</div>
                        <div className="text-[10px] text-gray-500 font-medium">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleUpdate(user.id, e.target.value as UserRole, user.companyId)}
                      className="bg-gray-900 border border-gray-800 text-xs font-bold text-gray-300 px-3 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
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
                      className="bg-gray-900 border border-gray-800 text-xs font-bold text-gray-300 px-3 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-30"
                    >
                      <option value="">Nenhuma (Global)</option>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
