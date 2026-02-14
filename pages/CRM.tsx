
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ExternalLink, 
  MoreVertical, 
  UserPlus,
  Mail,
  Calendar,
  X,
  Loader2
} from 'lucide-react';
import { MOCK_COMPANIES } from '../services/mockData';
import { dbService } from '../services/dbService';
import { Company } from '../types';

const CRM: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newCompany, setNewCompany] = useState({
    name: '',
    plan: 'Basic' as const,
    activeCampaigns: 0,
    startDate: new Date().toISOString().split('T')[0]
  });

  const fetchCompanies = async () => {
    setLoading(true);
    const data = await dbService.getCompanies();
    // Se não houver dados no Firebase, usamos o mock para não ficar vazio no teste inicial
    setCompanies(data.length > 0 ? data : MOCK_COMPANIES);
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dbService.addCompany(newCompany);
      await fetchCompanies();
      setIsModalOpen(false);
      setNewCompany({ name: '', plan: 'Basic', activeCampaigns: 0, startDate: new Date().toISOString().split('T')[0] });
    } catch (error) {
      alert("Erro ao salvar. Verifique se configurou o Firebase corretamente no arquivo lib/firebase.ts");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-white">Gestão de Carteira</h2>
          <p className="text-sm text-gray-500">{companies.length} clientes ativos na base</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all"
        >
          <UserPlus size={18} />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>Sincronizando com Firestore...</p>
        </div>
      ) : (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/50 border-b border-gray-800">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Empresa</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Plano</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Desde</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Campanhas</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-500 font-bold mr-3">
                          {company.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{company.name}</div>
                          <div className="text-xs text-gray-500">ID: {company.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        company.plan === 'Enterprise' ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {company.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar size={14} className="mr-2" />
                        {new Date(company.startDate).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-white">{company.activeCampaigns}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center text-xs font-medium text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></span>
                        Ativo
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 text-gray-500 hover:text-white transition-colors">
                          <Mail size={16} />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-indigo-400 transition-colors">
                          <ExternalLink size={16} />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-white">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Novo Cliente</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Nome da Empresa</label>
                <input 
                  required
                  type="text" 
                  value={newCompany.name}
                  onChange={e => setNewCompany({...newCompany, name: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                  placeholder="Ex: Loja de Roupas LTDA"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Plano</label>
                  <select 
                    value={newCompany.plan}
                    onChange={e => setNewCompany({...newCompany, plan: e.target.value as any})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Data de Início</label>
                  <input 
                    type="date" 
                    value={newCompany.startDate}
                    onChange={e => setNewCompany({...newCompany, startDate: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button 
                  disabled={isSaving}
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <span>Confirmar Cadastro</span>}
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
