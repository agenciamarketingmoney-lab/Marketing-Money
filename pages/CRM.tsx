
import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Mail, Calendar, X, Loader2, Users, AlertTriangle, ExternalLink as LinkIcon, Zap
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { Company } from '../types';

const CRM: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState(false);
  const [apiError, setApiError] = useState<{message: string, type: 'api' | 'permission' | 'unknown' | 'timeout'} | null>(null);
  
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
      console.warn("Falha ao buscar empresas, tentando local...");
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

    // Timer de segurança de 5 segundos
    const timer = setTimeout(() => {
      if (!forceLocal && isSaving) {
        setSaveTimeout(true);
        setApiError({ message: "O Google Cloud está demorando muito para responder.", type: 'timeout' });
      }
    }, 5000);

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
      console.error("Erro no cadastro:", error);
      const msg = error.message || "";
      if (msg.includes("API has not been used")) {
        setApiError({ message: "API Firestore Desativada no Painel Google.", type: 'api' });
      } else if (msg.includes("permission-denied")) {
        setApiError({ message: "Sem permissão no Firestore (Verifique Regras).", type: 'permission' });
      } else {
        setApiError({ message: "Erro de conexão ou timeout.", type: 'unknown' });
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
                <th className="px-6 py-5">Status</th>
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
                      {company.id.startsWith('local_') ? 'Modo Local' : 'Nuvem Nexus'}
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
          <h3 className="text-white font-bold">Nenhum cliente real</h3>
          <p className="text-gray-500 text-sm max-w-xs mt-2">Cadastre o seu primeiro cliente real para desbloquear as métricas.</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Novo Cliente Real</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              {(apiError || saveTimeout) && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl space-y-4">
                  <div className="flex items-start space-x-3 text-amber-400">
                    <AlertTriangle size={20} className="shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold leading-tight uppercase">{apiError?.message || "Servidor demorando demais"}</p>
                      <p className="text-[10px] opacity-70">Para evitar travamentos, você pode salvar apenas neste computador por enquanto.</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleSave(undefined, true)}
                    className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-black py-3 rounded-xl uppercase flex items-center justify-center transition-all"
                  >
                    <Zap size={14} className="mr-2" /> Forçar Salvamento Local
                  </button>
                  {apiError?.type === 'api' && (
                    <a 
                      href="https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=marketing-money" 
                      target="_blank" rel="noopener noreferrer"
                      className="block w-full text-center text-[10px] text-indigo-400 underline"
                    >
                      Ativar API Firestore no Google Cloud
                    </a>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Razão Social</label>
                  <input required value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3.5 text-sm text-white" placeholder="Ex: Grupo Cunha" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Plano</label>
                    <select value={newCompany.plan} onChange={e => setNewCompany({...newCompany, plan: e.target.value as any})} className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3.5 text-sm text-white">
                      <option value="Basic">Basic</option>
                      <option value="Pro">Pro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Início</label>
                    <input type="date" value={newCompany.startDate} onChange={e => setNewCompany({...newCompany, startDate: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3.5 text-sm text-white" />
                  </div>
                </div>
              </div>

              <button disabled={isSaving} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center">
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    <span>Sincronizando...</span>
                  </>
                ) : "Confirmar Cadastro Nexus"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
