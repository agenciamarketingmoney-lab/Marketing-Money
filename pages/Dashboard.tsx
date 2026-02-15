
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  DollarSign, 
  Lightbulb, 
  AlertCircle,
  ChevronDown,
  Filter,
  BarChart3,
  Database,
  Loader2,
  Sparkles,
  ShieldAlert,
  RefreshCcw,
  CheckCircle2,
  Lock
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
import { auth } from '../lib/firebase';
import { generateMarketingInsights } from '../services/geminiService';

const StatCard = ({ title, value, change, suffix = "", icon: Icon }: any) => (
  <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-indigo-600/10 rounded-xl text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
        <Icon size={24} />
      </div>
      {change !== undefined && (
        <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${change >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          {change >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-white tracking-tight">
      {suffix === 'R$' ? `R$ ${value.toLocaleString('pt-BR')}` : value.toLocaleString('pt-BR')}
      <span className="text-sm font-normal text-gray-500 ml-1">{suffix !== 'R$' && suffix}</span>
    </h3>
  </div>
);

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  // CLIENT deve obrigatoriamente usar seu companyId
  const initialCompany = user.role === UserRole.CLIENT ? user.companyId : 'all';
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(initialCompany || 'all');
  
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isDemo = !auth.currentUser;

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
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCompanyId]);

  const handleSeed = async () => {
    if (isDemo) return;
    setIsSeeding(true);
    setErrorMsg(null);
    try {
      await dbService.seedDatabase();
      setSeedSuccess(true);
      await fetchData();
      setTimeout(() => setSeedSuccess(false), 5000);
    } catch (err: any) {
      setErrorMsg("Erro: Verifique as regras do Firestore.");
    } finally {
      setIsSeeding(false);
    }
  };

  const totalSpend = metrics.reduce((acc, m) => acc + m.spend, 0);
  const totalLeads = metrics.reduce((acc, m) => acc + m.leads, 0);
  const totalRevenue = metrics.reduce((acc, m) => acc + m.revenue, 0);
  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Banner de Seed apenas para Admin se banco estiver vazio */}
      {user.role === UserRole.ADMIN && !loading && companies.length === 0 && (
        <div className="bg-gradient-to-r from-indigo-900/40 to-indigo-600/10 border border-indigo-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          <div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Configurar Banco</h3>
            <p className="text-gray-400 text-sm max-w-lg mb-4 leading-relaxed">Detectamos um banco novo. Inicialize os dados de teste da Nexus.</p>
          </div>
          <button onClick={handleSeed} disabled={isSeeding} className="px-8 py-4 rounded-2xl font-black text-sm bg-indigo-600 text-white shadow-2xl">
            {isSeeding ? <Loader2 className="animate-spin" size={18} /> : "Popular Firestore"}
          </button>
        </div>
      )}

      {/* Header com Filtros Respeitando Role */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center">
            {selectedCompanyId === 'all' ? 'Portfólio Global' : companies.find(c => c.id === selectedCompanyId)?.name}
            <div className="ml-4 flex items-center bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase px-2 py-1 rounded-full border border-emerald-500/20">
              <span className="w-1 h-1 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
              Live
            </div>
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={fetchData} className="p-2.5 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-xl transition-all">
            <RefreshCcw size={18} className={loading ? "animate-spin text-indigo-500" : ""} />
          </button>
          
          <div className="relative">
            {user.role === UserRole.CLIENT ? (
              <div className="bg-gray-900/50 border border-gray-800 text-gray-500 text-xs font-bold px-5 py-3 rounded-2xl flex items-center space-x-2">
                <Lock size={14} />
                <span>Conta Vinculada</span>
              </div>
            ) : (
              <>
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <select 
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="bg-[#111827] border border-gray-800 text-white text-sm font-bold rounded-2xl pl-12 pr-10 py-3 appearance-none outline-none cursor-pointer min-w-[240px]"
                >
                  <option value="all">Ver Tudo (Admin)</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Investimento AdSpend" value={totalSpend} suffix="R$" icon={DollarSign} />
        <StatCard title="Total Leads (CPL)" value={Math.floor(totalLeads)} icon={Users} />
        <StatCard title="ROAS Consolidado" value={roas.toFixed(2)} suffix="x" icon={Target} />
        <StatCard title="Receita Gerada" value={totalRevenue} suffix="R$" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-[2.5rem] p-8">
          <div className="h-[400px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" opacity={0.5} />
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#0b0f1a', border: '1px solid #1f2937', borderRadius: '1.5rem' }} />
                  <Area type="monotone" dataKey="spend" stroke="#6366f1" fill="url(#colorSpend)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
              <Lightbulb size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-none">Nexus AI</h3>
              <p className="text-[10px] text-indigo-400 font-black uppercase mt-1">Inteligência Estratégica</p>
            </div>
          </div>
          <div className="flex-1 space-y-6">
            {insights ? (
              <p className="text-sm text-gray-300 italic border-l-2 border-indigo-500 pl-4">"{insights.summary}"</p>
            ) : (
              <p className="text-xs text-gray-600 font-bold uppercase">Sincronizando dados para análise...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
