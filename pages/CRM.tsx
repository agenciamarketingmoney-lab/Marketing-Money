
import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Mail, Calendar, X, Loader2, Users, AlertTriangle, ExternalLink as LinkIcon, Zap, Info
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { Company } from '../types';

const CRM: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState(false);
  const [apiError, setApiError] = useState<{message: string, code?: string, type: 'api' | 'permission' | 'unknown' | 'timeout'} | null>(null);
  
  const [newCompany, setNewCompany] = useState({
    name: '',
    plan: 'Basic' as const,
    activeCampaigns: 0,
    startDate: new Date().toISOString().split('T')[0]
  });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await dbService.getCompanies();
      setCompanies(data);
    } catch (err) {
      console.warn("Nexus: Falha na busca, banco pode estar vazio ou desconectado.");
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
    setSaveTimeout(false);

    // Timer de segurança estendido para 10 segundos
    const timer = setTimeout(() => {
      if (!forceLocal && isSaving) {
        setSaveTimeout(true);
        setApiError({ message: "O Google Cloud está demorando muito. Verifique se o banco de dados foi criado no console.", type: 'timeout' });
        setIsSaving(false);
      }
    }, 10000);

    try {
      if (forceLocal) {
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
      console.error("Detalhes do Erro Firebase:", error);
      const msg = error.message || "Erro desconhecido";
      const code = error.code || "unknown";
      
      if (msg.includes("API has not been used") || code === 'failed-precondition') {
        setApiError({ message: "API Firestore Desativada. Ative no Google Cloud Console.", code, type: 'api' });
      } else if (code === 'permission-denied') {
        setApiError({ message: "Acesso Negado. Verifique as Regras de Segurança.", code, type: 'permission' });
      } else {
        setApiError({ message: "Falha de Conexão: " + msg, code, type: 'unknown' });
      }
    } finally {
      clearTimeout(timer);
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Gestão de Carteira</h2>
          <p className="text-sm text-gray-500">{companies.length} clientes na base</p>
        </div>
        <button 
          onClick={() => { setApiError(null); setSaveTimeout(false); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <UserPlus size={18} />
          <span>Novo Cliente</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-600">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p className="text-sm font-medium uppercase tracking-widest">Sincronizando base...</p>
        </div>
      ) : companies.length > 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-800 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                <th className="px-6 py-5">Empresa</th>
                <th className="px-6 py-5">Plano</th>
                <th className="px-6 py-5">Conexão</th>
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
                      <div className="text-[9px] text-gray-600 uppercase font-mono">ID: {company.id.substring(0,8)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{company.plan}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-black uppercase tracking-tighter flex items-center ${company.id.startsWith('local_') ? 'text-amber-400' : 'text-emerald-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${company.id.startsWith('local_') ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                      {company.id.startsWith('local_') ? 'Offline' : 'Online (Nuvem)'}
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
          <h3 className="text-white font-bold">Base de Dados Vazia</h3>
          <p className="text-gray-500 text-sm max-w-xs mt-2">Clique em "Novo Cliente" para testar sua conexão com o Firestore.</p>
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
                <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl space-y-4">
                  <div className="flex items-start space-x-3 text-rose-400">
                    <AlertTriangle size={20} className="shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold leading-tight uppercase">Erro de Sincronização</p>
                      <p className="text-[10px] opacity-80 font-mono">{apiError.message}</p>
                      {apiError.code && <p className="text-[9px] opacity-50 font-mono">CODE: {apiError.code}</p>}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <button 
                      type="button"
                      onClick={() => handleSave(undefined, true)}
                      className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-black py-3 rounded-xl uppercase flex items-center justify-center transition-all"
                    >
                      <Zap size={14} className="mr-2" /> Forçar Offline (Salva Local)
                    </button>
                    <button 
                      type="button"
                      onClick={() => window.location.reload()}
                      className="w-full text-[9px] text-gray-400 hover:text-white underline py-1"
                    >
                      Recarregar Aplicação
                    </button>
                  </div>
                </div>
              )}

              {!apiError && (
                <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl flex items-center space-x-3 text-indigo-300">
                  <Info size={16} />
                  <p className="text-[10px] leading-tight">Os dados serão enviados para o projeto <b>marketing-money</b> no Firebase.</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Nome da Empresa</label>
                  <input required value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3.5 text-sm text-white" placeholder="Ex: Nexus Agency" />
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
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    <span>Conectando...</span>
                  </>
                ) : "Salvar no Banco Nexus"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
