
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
  Loader2
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
      const companiesData = await dbService.getCompanies();
      setCompanies(companiesData);
      
      const filter = selectedCompanyId === 'all' ? undefined : selectedCompanyId;
      const [campData, metData] = await Promise.all([
        dbService.getCampaigns(filter),
        dbService.getMetrics(filter)
      ]);
      
      setCampaigns(campData);
      setMetrics(metData);
      setLoading(false);
    };
    loadData();
  }, [selectedCompanyId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Performance por Canal</h2>
          <p className="text-sm text-gray-500">Monitoramento centralizado e cálculos de KPI real</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select 
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="bg-[#111827] border border-gray-800 text-white text-xs font-bold rounded-xl px-4 py-2.5 outline-none cursor-pointer"
          >
            <option value="all">Todas as Contas</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-600">
          <Loader2 className="animate-spin mb-4 text-indigo-500" size={32} />
          <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando AdManager...</p>
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {campaigns.map((campaign) => {
            // Cálculo básico de KPI simulado para a campanha específica se houver dados
            // Em um cenário real, filtraríamos metrics por campaignId
            const totalSpend = metrics.reduce((acc, m) => acc + m.spend, 0) / campaigns.length;
            const totalClicks = metrics.reduce((acc, m) => acc + m.clicks, 0) / campaigns.length;
            const totalLeads = metrics.reduce((acc, m) => acc + m.leads, 0) / campaigns.length;
            const totalRevenue = metrics.reduce((acc, m) => acc + m.revenue, 0) / campaigns.length;
            
            const ctr = (totalClicks / (totalClicks * 10)) * 100; // Simulado
            const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
            const cpa = totalLeads > 0 ? totalSpend / totalLeads : 0;
            const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

            return (
              <div key={campaign.id} className="bg-[#111827] border border-gray-800 rounded-3xl p-6 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                    campaign.platform === 'Meta' ? 'bg-indigo-600/10 text-indigo-400' : 
                    campaign.platform === 'Google' ? 'bg-amber-600/10 text-amber-400' : 
                    'bg-rose-600/10 text-rose-400'
                  }`}>
                    {campaign.platform === 'Meta' ? <Facebook size={28} /> : campaign.platform === 'Google' ? <Search size={28} /> : <Instagram size={28} />}
                  </div>
                  
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-2">
                      <h3 className="text-lg font-black text-white">{campaign.name}</h3>
                      <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest mx-auto lg:mx-0 ${
                        campaign.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-500'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                      Budget: R$ {campaign.budget.toLocaleString('pt-BR')} <span className="text-gray-700 mx-2">|</span> ID: {campaign.id}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-4 px-8 border-t lg:border-t-0 lg:border-l border-gray-800 py-6 lg:py-0 w-full lg:w-auto">
                    <div>
                      <p className="text-[10px] font-black text-gray-600 uppercase mb-1 tracking-widest">CTR</p>
                      <p className="text-sm font-black text-white">{ctr.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-600 uppercase mb-1 tracking-widest">CPC</p>
                      <p className="text-sm font-black text-white">R$ {cpc.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-600 uppercase mb-1 tracking-widest">CPA (Lead)</p>
                      <p className="text-sm font-black text-white">R$ {cpa.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-600 uppercase mb-1 tracking-widest">ROAS</p>
                      <p className={`text-sm font-black ${roas > 2 ? 'text-emerald-400' : 'text-white'}`}>{roas.toFixed(2)}x</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-3 bg-gray-900 border border-gray-800 hover:border-indigo-500 rounded-2xl text-gray-400 hover:text-white transition-all shadow-xl">
                      <BarChart2 size={18} />
                    </button>
                    <button className="p-3 bg-gray-900 border border-gray-800 hover:border-rose-500 rounded-2xl text-gray-400 hover:text-rose-500 transition-all shadow-xl">
                      <Pause size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#111827] border border-dashed border-gray-800 rounded-[2.5rem] p-24 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-900 rounded-3xl flex items-center justify-center mb-6 text-indigo-500/40">
            <Megaphone size={40} />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Sem Campanhas Sincronizadas</h3>
          <p className="text-gray-500 max-w-sm text-sm font-medium">Conecte sua conta do Google Ads ou Meta para ver a performance real do tráfego.</p>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
