
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
  Megaphone
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { Campaign, Company } from '../types';

const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const companiesData = await dbService.getCompanies();
      setCompanies(companiesData);
    };
    load();
  }, []);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      const data = await dbService.getCampaigns(selectedCompanyId === 'all' ? undefined : selectedCompanyId);
      setCampaigns(data);
      setLoading(false);
    };
    fetchCampaigns();
  }, [selectedCompanyId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-white">Gestão de Canais</h2>
          <p className="text-sm text-gray-500">Monitoramento centralizado de tráfego pago</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <select 
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="bg-[#111827] border border-gray-800 text-white text-sm rounded-xl pl-10 pr-10 py-2.5 appearance-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none cursor-pointer min-w-[200px]"
            >
              <option value="all">Todas as Contas</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-600">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium">Sincronizando contas de anúncios...</p>
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-[#111827] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all group">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className={`p-4 rounded-2xl flex items-center justify-center transition-colors ${
                  campaign.platform === 'Meta' ? 'bg-indigo-600/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white' : 
                  campaign.platform === 'Google' ? 'bg-amber-600/10 text-amber-400 group-hover:bg-amber-600 group-hover:text-white' : 
                  'bg-rose-600/10 text-rose-400 group-hover:bg-rose-600 group-hover:text-white'
                }`}>
                  {campaign.platform === 'Meta' ? <Facebook size={24} /> : campaign.platform === 'Google' ? <Search size={24} /> : <Instagram size={24} />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-white">{campaign.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                      campaign.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-500'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                    Orçamento: R$ {campaign.budget.toLocaleString('pt-BR')} /mês
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:px-8 border-l border-gray-800">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">CTR</p>
                    <p className="text-sm font-bold text-white">--</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">CPC</p>
                    <p className="text-sm font-bold text-white">--</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">CPA</p>
                    <p className="text-sm font-bold text-white">--</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">ROAS</p>
                    <p className="text-sm font-bold text-emerald-400">--</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2.5 bg-gray-900 border border-gray-800 hover:border-indigo-500 rounded-xl text-gray-300 transition-all">
                    <BarChart2 size={18} />
                  </button>
                  <button className="p-2.5 bg-gray-900 border border-gray-800 hover:border-rose-500 hover:text-rose-500 rounded-xl text-gray-300 transition-all">
                    <Pause size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#111827] border border-dashed border-gray-800 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 text-indigo-500">
            <Megaphone size={40} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhuma campanha ativa</h3>
          <p className="text-gray-500 max-w-sm">Conecte sua conta do Gerenciador de Negócios da Meta ou Google para começar a monitorar resultados.</p>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
