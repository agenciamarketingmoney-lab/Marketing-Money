
import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  Facebook, 
  Search, 
  TrendingUp,
  Activity,
  Pause,
  Play,
  BarChart2,
  ChevronDown,
  Filter,
  Megaphone,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { Campaign, Company, DailyMetrics } from '../types';

const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const companiesData = await dbService.getCompanies();
        setCompanies(companiesData);
        
        const filter = selectedCompanyId === 'all' ? undefined : selectedCompanyId;
        const [campData, metData] = await Promise.all([
          dbService.getCampaigns(filter),
          dbService.getMetrics(filter)
        ]);
        
        setCampaigns(campData);
        setMetrics(metData);
      } catch (e) {
        console.error("Erro ao carregar campanhas:", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedCompanyId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Performance de Tráfego</h2>
          <p className="text-sm text-gray-500">Métricas consolidadas das plataformas Meta, Google e TikTok</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <select 
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="bg-[#111827] border border-gray-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl pl-9 pr-8 py-2.5 outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Filtro: Todos os Clientes</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Auditando Ads Manager...</p>
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-[#111827] border border-gray-800 rounded-[2rem] p-8 hover:border-indigo-500/30 transition-all group relative overflow-hidden shadow-xl">
              <div className="flex flex-col lg:flex-row items-center gap-10">
                <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-2xl ${
                  campaign.platform === 'Meta' ? 'bg-indigo-600/10 text-indigo-400' : 
                  campaign.platform === 'Google' ? 'bg-amber-600/10 text-amber-400' : 
                  'bg-rose-600/10 text-rose-400'
                }`}>
                  {campaign.platform === 'Meta' ? <Facebook size={32} /> : campaign.platform === 'Google' ? <Search size={32} /> : <Instagram size={32} />}
                </div>
                
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-3">
                    <h3 className="text-xl font-black text-white">{campaign.name}</h3>
                    <span className={`inline-block text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mx-auto lg:mx-0 ${
                      campaign.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-500'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 uppercase font-black tracking-widest">
                    Investimento Programado: R$ {campaign.budget.toLocaleString('pt-BR')} <span className="text-gray-800 mx-3">|</span> Ref: {campaign.id}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button className="p-4 bg-gray-900 border border-gray-800 hover:border-indigo-500 rounded-2xl text-gray-500 hover:text-white transition-all active:scale-95">
                    <BarChart2 size={20} />
                  </button>
                  <button className="p-4 bg-gray-900 border border-gray-800 hover:border-rose-500 rounded-2xl text-gray-500 hover:text-rose-500 transition-all active:scale-95">
                    <Pause size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#111827] border border-dashed border-gray-800 rounded-[3rem] p-32 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-gray-900 rounded-[2rem] flex items-center justify-center mb-8 text-gray-700">
            <Megaphone size={48} />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">Nenhuma Campanha Ativa</h3>
          <p className="text-gray-500 max-w-sm text-sm font-medium leading-relaxed">
            Cadastre os dados reais da campanha no banco de dados para ativar o monitoramento de performance.
          </p>
          <div className="mt-8 flex items-center text-[10px] text-indigo-400 font-black uppercase tracking-widest bg-indigo-400/5 px-4 py-2 rounded-full border border-indigo-400/10">
            <AlertCircle size={14} className="mr-2" />
            Aguardando integração com AdManager
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
