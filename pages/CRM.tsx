
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ExternalLink, 
  MoreVertical, 
  UserPlus,
  Mail,
  Calendar,
  X,
  Loader2,
  Users,
  AlertTriangle,
  ExternalLink as LinkIcon,
  Info
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { Company } from '../types';

const CRM: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<{message: string, link?: string} | null>(null);
  
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
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setApiError(null);

    // Timeout de segurança: Se em 8 segundos não responder, é erro de conexão/permissão
    const timeoutId = setTimeout(() => {
      if (isSaving) {
        setIsSaving(false);
        setApiError({
          message: "O Firebase não respondeu a tempo. Geralmente isso indica que a API do Firestore está desativada ou você está sem permissão de escrita.",
          link: "https://console.firebase.google.com/project/marketing-money/firestore"
        });
      }
    }, 8000);

    try {
      await dbService.addCompany(newCompany);
      clearTimeout(timeoutId);
      await fetchCompanies();
      setIsModalOpen(false);
      setNewCompany({ name: '', plan: 'Basic', activeCampaigns: 0, startDate: new Date().toISOString().split('T')[0] });
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("Erro ao cadastrar:", error);
      
      const errorMsg = error.message || "";
      if (errorMsg.includes("permission-denied") || errorMsg.includes("API has not been used")) {
        setApiError({
          message: "Acesso Negado: A API do Cloud Firestore precisa ser ativada no seu console Google Cloud.",
          link: "https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=marketing-money"
        });
      } else {
        setApiError({
          message: "Erro técnico ao salvar. Verifique se as regras de segurança do Firestore permitem gravação."
        });
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
          <p className="text-sm text-gray-500">{companies.length} clientes reais na base</p>
        </div>
        <button 
          onClick={() => {
            setApiError(null);
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <UserPlus size={18} />
          <span>Novo Cliente</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-600">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p className="text-sm font-medium tracking-widest uppercase">Consultando Firestore...</p>
        </div>
      ) : companies.length > 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/50 border-b border-gray-800">
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Empresa</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Plano Nexus</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Início do Contrato</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Campanhas</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-800/20 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black mr-3 shadow-lg shadow-indigo-600/10 uppercase">
                          {company.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{company.name}</div>
                          <div className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase">ID: {company.id?.substring(0,8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${
                        company.plan === 'Enterprise' ? 'border-purple-500/20 bg-purple-500/10 text-purple-400' : 
                        company.plan === 'Pro' ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400' :
                        'border-gray-700 bg-gray-800 text-gray-500'
                      }`}>
                        {company.plan}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs text-gray-400 font-medium">
                      {new Date(company.startDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-white text-sm">
                      {company.activeCampaigns}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all"><Mail size={16} /></button>
                        <button className="p-2 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"><ExternalLink size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#111827] border border-dashed border-gray-800 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 text-indigo-500/20">
            <Users size={40} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Sem clientes reais</h3>
          <p className="text-gray-500 max-w-sm mb-8">Comece agora a cadastrar seus clientes para centralizar a inteligência da agência.</p>
          <button onClick={() => setIsModalOpen(true)} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all">Cadastrar Primeiro Cliente</button>
        </div>
      )}

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <h3 className="text-xl font-bold text-white">Novo Cliente Real</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              {apiError && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl flex flex-col space-y-3">
                  <div className="flex items-start space-x-3 text-rose-400">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold leading-relaxed">{apiError.message}</p>
                  </div>
                  {apiError.link && (
                    <a 
                      href={apiError.link}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-black py-2 rounded-lg text-center uppercase tracking-widest transition-all flex items-center justify-center"
                    >
                      Resolver no Console Google <LinkIcon size={12} className="ml-1" />
                    </a>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest ml-1">Razão Social / Nome Fantasia</label>
                  <input 
                    required
                    type="text" 
                    value={newCompany.name}
                    onChange={e => setNewCompany({...newCompany, name: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white transition-all"
                    placeholder="Ex: Grupo Cunha"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest ml-1">Plano Nexus</label>
                    <select 
                      value={newCompany.plan}
                      onChange={e => setNewCompany({...newCompany, plan: e.target.value as any})}
                      className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white transition-all appearance-none"
                    >
                      <option value="Basic">Basic</option>
                      <option value="Pro">Pro</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest ml-1">Data Início</label>
                    <input 
                      type="date" 
                      value={newCompany.startDate}
                      onChange={e => setNewCompany({...newCompany, startDate: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  disabled={isSaving}
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 disabled:text-gray-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span className="ml-2 uppercase tracking-widest text-[10px]">Sincronizando...</span>
                    </>
                  ) : <span>Confirmar Cadastro Nexus</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
