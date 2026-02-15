
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  DollarSign, 
  Lightbulb, 
  ChevronDown,
  Filter,
  Loader2,
  RefreshCcw,
  Lock,
  BarChart3
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { User, AIInsight, Company, DailyMetrics, UserRole } from '../types';
import { dbService } from '../services/dbService';
import { generateMarketingInsights } from '../services/geminiService';

const StatCard = ({ title, value, change, suffix = "", icon: Icon }: any) => (
  <div className="bg-[#111827] border border-gray-800 rounded-[2rem] p-8 hover:border-indigo-500/50 transition-all duration-300 group shadow-lg">
    <div className="flex items-center justify-between mb-6">
      <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
        <Icon size={24} />
      </div>
    </div>
    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">{title}</p>
    <h3 className="text-3xl font-black text-white tracking-tight">
      {suffix === 'R$' ? `R$ ${value.toLocaleString('pt-BR')}` : value.toLocaleString('pt-BR')}
      <span className="text-sm font-bold text-gray-500 ml-1.5">{suffix !== 'R$' && suffix}</span>
    </h3>
  </div>
);

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const initialCompany = user.role === UserRole.CLIENT ? user.companyId : 'all';
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(initialCompany || 'all');
  
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const companiesData = await dbService.getCompanies(user);
      setCompanies(companiesData);
      
      const companyFilter = selectedCompanyId === 'all' ? undefined : selectedCompanyId;
      const metricsData = await dbService.getMetrics(companyFilter);
      setMetrics(metricsData);

      if (metricsData.length > 0) {
        setLoadingInsights(true);
        const res = await generateMarketingInsights(metricsData);
        setInsights(res);
        setLoadingInsights(false);
      } else {
        setInsights(null);
      }
    } catch (err) {
      console.error("Erro no Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedCompanyId]);

  const totalSpend = metrics.reduce((acc, m) => acc + m.spend, 0);
  const totalLeads = metrics.reduce((acc, m) => acc + m.leads, 0);
  const totalRevenue = metrics.reduce((acc, m) => acc + m.revenue, 0);
  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center uppercase">
            {selectedCompanyId === 'all' ? 'VISÃO ESTRATÉGICA' : companies.find(c => c.id === selectedCompanyId)?.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Inteligência de performance em tempo real</p>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={fetchData} className="p-3 bg-gray-900 border border-gray-800 text-gray-500 hover:text-white rounded-2xl transition-all active:scale-95 shadow-xl">
            <RefreshCcw size={18} className={loading ? "animate-spin text-indigo-500" : ""} />
          </button>
          
          <div className="relative">
            {user.role === UserRole.CLIENT ? (
              <div className="bg-gray-900/50 border border-gray-800 text-gray-500 text-[10px] font-black uppercase px-5 py-3.5 rounded-2xl flex items-center space-x-2 tracking-widest shadow-xl">
                <Lock size={14} className="text-indigo-500" />
                <span>Minha Conta</span>
              </div>
            ) : (
              <>
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <select 
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="bg-[#111827] border border-gray-800 text-white text-xs font-black uppercase tracking-widest rounded-2xl pl-12 pr-10 py-3.5 appearance-none outline-none cursor-pointer min-w-[260px] shadow-2xl focus:ring-2 focus:ring-indigo-500/30 transition-all"
                >
                  <option value="all">TODOS OS CLIENTES</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={16} />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Investimento" value={totalSpend} suffix="R$" icon={DollarSign} />
        <StatCard title="Total Leads" value={Math.floor(totalLeads)} icon={Users} />
        <StatCard title="ROAS Médio" value={roas.toFixed(2)} suffix="x" icon={Target} />
        <StatCard title="Faturamento" value={totalRevenue} suffix="R$" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-[3rem] p-10 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 size={120} />
          </div>
          <div className="relative z-10 h-[420px] w-full">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Sincronizando BI...</span>
              </div>
            ) : metrics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" opacity={0.3} />
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#0b0f1a', border: '1px solid #1f2937', borderRadius: '1.5rem', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="spend" stroke="#6366f1" fill="url(#colorSpend)" strokeWidth={4} animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-gray-900 rounded-3xl flex items-center justify-center mb-6 text-gray-700">
                    <BarChart3 size={32} />
                 </div>
                 <h4 className="text-white font-black uppercase tracking-widest text-sm mb-2">Sem dados de tráfego</h4>
                 <p className="text-gray-600 text-[10px] font-bold uppercase max-w-[200px]">Aguardando conexão com as plataformas de anúncios.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-[3rem] p-10 flex flex-col relative overflow-hidden shadow-2xl">
          <div className="flex items-center space-x-4 mb-10">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Lightbulb size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white leading-none uppercase">Nexus AI</h3>
              <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.2em] mt-2">Machine Learning</p>
            </div>
          </div>
          
          <div className="flex-1 space-y-6">
            {insights ? (
              <div className="space-y-6 animate-in slide-in-from-bottom duration-1000">
                 <p className="text-sm text-gray-400 leading-relaxed font-medium italic border-l-4 border-indigo-600 pl-6 py-2">
                   "{insights.summary}"
                 </p>
                 <div className="space-y-4">
                    {insights.alerts.slice(0, 2).map((alert, i) => (
                      <div key={i} className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl text-[11px] text-rose-400 font-bold uppercase tracking-wide">
                        ⚠️ {alert}
                      </div>
                    ))}
                 </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest leading-relaxed">
                  {loadingInsights ? "Analisando variáveis de performance..." : "Cadastre métricas reais para ativar os insights de IA."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
