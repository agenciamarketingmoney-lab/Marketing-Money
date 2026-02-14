
import React from 'react';
import { 
  Instagram, 
  Facebook, 
  Search, 
  TrendingUp,
  Activity,
  Pause,
  Play,
  BarChart2
} from 'lucide-react';
import { MOCK_CAMPAIGNS } from '../services/mockData';

const CampaignsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-lg font-bold text-white">Gerenciador de Campanhas</h2>
          <p className="text-sm text-gray-500">Monitoramento em tempo real de Meta, Google e TikTok</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 flex items-center text-xs font-semibold text-gray-400">
            <Activity size={14} className="mr-2 text-emerald-500" />
            Integrado com Meta Ads
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_CAMPAIGNS.map((campaign) => (
          <div key={campaign.id} className="bg-[#111827] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="p-4 bg-indigo-600/10 rounded-xl text-indigo-500 flex items-center justify-center">
                {campaign.platform === 'Meta' ? <Facebook size={24} /> : <Search size={24} />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-white">{campaign.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    campaign.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-500'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                  Budget: R$ {campaign.budget.toLocaleString('pt-BR')} /mês
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:px-8 border-l border-gray-800">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">CTR</p>
                  <p className="text-sm font-bold text-white">1.84%</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">CPC</p>
                  <p className="text-sm font-bold text-white">R$ 0,42</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">CPA</p>
                  <p className="text-sm font-bold text-white">R$ 12,50</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">ROAS</p>
                  <p className="text-sm font-bold text-emerald-400">4.2x</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors">
                  <BarChart2 size={18} />
                </button>
                <button className="p-2 bg-gray-800 hover:bg-rose-500/20 hover:text-rose-500 rounded-lg text-gray-300 transition-colors">
                  <Pause size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignsPage;
