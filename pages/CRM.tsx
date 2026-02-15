
import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Mail, Calendar, X, Loader2, Users, AlertTriangle, ExternalLink as LinkIcon, Zap, Info, ShieldAlert
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { auth } from '../lib/firebase';
import { Company } from '../types';

const CRM: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<{message: string, code?: string, type: 'api' | 'permission' | 'unknown' | 'timeout' | 'demo'} | null>(null);
  
  // Verifica se o usuário está REALMENTE logado no Firebase ou se é Demo
  const isDemoUser = !auth.currentUser;

  const [newCompany, setNewCompany] = useState({
    name: '',
    plan: 'Basic' as const,
    activeCampaigns: 0,
    startDate: new Date().toISOString().split('T')[0]
  });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const remoteData = await dbService.getCompanies();
      const localData = JSON.parse(localStorage.getItem('nexus_local_companies') || '[]');
      
      // Merge de dados (remotos + locais) para o usuário ver tudo
      const combined = [...localData, ...remoteData.filter(r => !localData.find((l:any) => l.id === r.id))];
      setCompanies(combined);
    } catch (err) {
      console.warn("Nexus: Operando em modo offline/local.");
      const localData = JSON.parse(localStorage.getItem('nexus_local_companies') || '[]');
      setCompanies(localData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSave = async (e?: React.FormEvent, forceLocal = false) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setApiError(null);

    if (isDemoUser && !forceLocal) {
      setApiError({ 
        message: "Você está em modo DEMO. O Firebase bloqueia gravações de usuários não autenticados por segurança.", 
        type: 'demo' 
      });
      setIsSaving(false);
      return;
    }

    try {
      if (forceLocal || isDemoUser) {
        const localData = JSON.parse(localStorage.getItem('nexus_local_companies') || '[]');
        const newLocal = { ...newCompany, id: 'local_' + Date.now() };
        localData.push(newLocal);
        localStorage.setItem('nexus_local_companies', JSON.stringify(localData));
        await fetchCompanies();
        setIsModalOpen(false);
      } else {
        await dbService.addCompany(newCompany);
        await fetchCompanies();
        setIsModalOpen(false);
      }
    } catch (error: any) {
      const code = error.code || "unknown";
      if (code === 'permission-denied') {
        setApiError({ message: "Acesso Negado. O servidor Firebase exige um login real para gravar dados.", code, type: 'permission' });
      } else {
        setApiError({ message: "Erro: " + error.message, code, type: 'unknown' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Gestão de Carteira</h2>
          <div className="flex items-center space-x-2 mt-1">
             <p className="text-sm text-gray-500">{companies.length} clientes na base</p>
             {isDemoUser && (
               <span className="flex items-center text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                 <ShieldAlert size={10} className="mr-1" /> Modo Visualização
               </span>
             )}
          </div>
        </div>
        <button 
          onClick={() => { setApiError(null); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <UserPlus size={18} />
          <span>Novo Cliente</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-600">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p className="text-sm font-medium uppercase tracking-widest">Sincronizando Nexus...</p>
        </div>
      ) : companies.length > 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-800 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                <th className="px-6 py-5">Empresa</th>
                <th className="px-6 py-5">Plano</th>
                <th className="px-6 py-5">Status Cloud</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-800/20 transition-all group">
                  <td className="px-6 py-5 flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black mr-3 uppercase">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{company.name}</div>
                      <div className="text-[9px] text-gray-600 font-mono">ID: {company.id.substring(0,12)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{company.plan}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-black uppercase flex items-center ${String(company.id).startsWith('local_') ? 'text-amber-400' : 'text-emerald-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${String(company.id).startsWith('local_') ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                      {String(company.id).startsWith('local_') ? 'Local (Browser)' : 'Sincronizado'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-gray-600 hover:text-white"><Mail size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[#111827] border border-dashed border-gray-800 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
          <Users size={40} className="text-gray-800 mb-4" />
          <h3 className="text-white font-bold">Sem Clientes</h3>
          <p className="text-gray-500 text-sm mt-2">Adicione seu primeiro cliente para começar.</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Novo Cadastro</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              {apiError && (
                <div className={`border p-5 rounded-2xl space-y-4 ${apiError.type === 'demo' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                  <div className={`flex items-start space-x-3 ${apiError.type === 'demo' ? 'text-amber-400' : 'text-rose-400'}`}>
                    <AlertTriangle size={20} className="shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase">{apiError.type === 'demo' ? 'Aviso de Demonstração' : 'Erro de Permissão'}</p>
                      <p className="text-[10px] opacity-80 leading-relaxed">{apiError.message}</p>
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => handleSave(undefined, true)}
                    className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-black py-3 rounded-xl uppercase flex items-center justify-center transition-all"
                  >
                    <Zap size={14} className="mr-2" /> Salvar Apenas Neste Computador
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Nome da Empresa</label>
                  <input required value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="Ex: Nexus Agency" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Plano</label>
                    <select value={newCompany.plan} onChange={e => setNewCompany({...newCompany, plan: e.target.value as any})} className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3.5 text-sm text-white">
                      <option value="Basic">Basic</option>
                      <option value="Pro">Pro</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Início</label>
                    <input type="date" value={newCompany.startDate} onChange={e => setNewCompany({...newCompany, startDate: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3.5 text-sm text-white" />
                  </div>
                </div>
              </div>

              <button disabled={isSaving} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center transition-all">
                {isSaving ? <Loader2 className="animate-spin mr-2" size={20} /> : "Tentar Salvar na Nuvem"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
