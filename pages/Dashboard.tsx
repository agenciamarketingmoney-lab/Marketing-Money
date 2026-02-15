
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
  CheckCircle2
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
import { User, AIInsight, Company, DailyMetrics } from '../types';
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
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(user.companyId || 'all');
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
      const companiesData = await dbService.getCompanies();
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
    if (isDemo) {
      alert("Modo Demo: Para popular o Firestore real, faça login com seu e-mail criado no console.");
      return;
    }
    
    setIsSeeding(true);
    setErrorMsg(null);
    
    try {
      await dbService.seedDatabase();
      setSeedSuccess(true);
      await fetchData();
      setTimeout(() => setSeedSuccess(false), 5000);
    } catch (err: any) {
      if (err.message.includes("permissions")) {
        setErrorMsg("Erro de Permissão: Publique as regras no Firebase Console primeiro.");
      } else {
        setErrorMsg("Erro: " + err.message);
      }
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
      {/* Banner de Boas-vindas / Seed */}
      {!loading && companies.length === 0 && (
        <div className="bg-gradient-to-r from-indigo-900/40 to-indigo-600/10 border border-indigo-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-5">
            <Database size={200} />
          </div>
          <div className="z-10">
            <div className="flex items-center space-x-2 text-indigo-400 mb-3">
              <Sparkles size={20} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Conectado à Nexus Cloud</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Primeiros Passos</h3>
            <p className="text-gray-400 text-sm max-w-lg mb-4 leading-relaxed">
              Detectamos que seu banco de dados está pronto para receber dados. 
              Deseja carregar a estrutura de demonstração (clientes, campanhas e métricas) agora?
            </p>
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-[10px] uppercase font-bold flex items-start space-x-2 max-w-md">
                <ShieldAlert size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
          <button 
            onClick={handleSeed}
            disabled={isSeeding || seedSuccess}
            className={`z-10 px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center space-x-3 shadow-2xl ${
              seedSuccess 
              ? 'bg-emerald-600 text-white' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95 shadow-indigo-600/30'
            }`}
          >
            {isSeeding ? <Loader2 className="animate-spin" size={18} /> : seedSuccess ? <CheckCircle2 size={18} /> : <Database size={18} />}
            <span>{seedSuccess ? "Banco Populado!" : "Inicializar Estrutura"}</span>
          </button>
        </div>
      )}

      {/* Header com Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center">
            {selectedCompanyId === 'all' ? 'Visão Consolidada' : companies.find(c => c.id === selectedCompanyId)?.name}
            <div className="ml-4 flex items-center bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase px-2 py-1 rounded-full border border-emerald-500/20">
              <span className="w-1 h-1 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
              Live
            </div>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Análise de performance em tempo real de {companies.length} contas.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchData}
            className="p-2.5 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-xl transition-all"
            title="Atualizar Dados"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin text-indigo-500" : ""} />
          </button>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <select 
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="bg-[#111827] border border-gray-800 text-white text-sm font-bold rounded-2xl pl-12 pr-10 py-3 appearance-none focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none cursor-pointer min-w-[240px]"
            >
              <option value="all">Portfólio Completo</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Principais KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Investimento AdSpend" value={totalSpend} suffix="R$" icon={DollarSign} />
        <StatCard title="Total Leads (CPL)" value={Math.floor(totalLeads)} icon={Users} />
        <StatCard title="ROAS Consolidado" value={roas.toFixed(2)} suffix="x" icon={Target} />
        <StatCard title="Receita Gerada" value={totalRevenue} suffix="R$" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Performance */}
        <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Evolução de Performance</h3>
              <p className="text-sm text-gray-500 font-medium">Investimento diário em tráfego pago</p>
            </div>
            <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">AdSpend</span>
               </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="animate-spin text-indigo-500" size={32} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Sincronizando...</span>
                </div>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#4b5563', fontSize: 10, fontWeight: 700}} 
                    dy={15}
                    tickFormatter={(str) => str.split('-').reverse().slice(0, 2).join('/')}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b0f1a', border: '1px solid #1f2937', borderRadius: '1.5rem', padding: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 800 }}
                    cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="spend" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorSpend)" 
                    strokeWidth={4} 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-900/20 rounded-3xl border border-dashed border-gray-800">
                <BarChart3 size={48} className="text-gray-800 mb-4" />
                <p className="text-gray-500 font-bold">Nenhuma métrica encontrada para o período selecionado.</p>
              </div>
            )}
          </div>
        </div>

        {/* IA Insights */}
        <div className="bg-[#111827] border border-gray-800 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Sparkles size={80} />
          </div>
          
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
              <Lightbulb size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight leading-none">Nexus AI</h3>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">Intelligence Layer</p>
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {loadingInsights ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <div className="h-3 bg-gray-800 rounded-full w-1/2"></div>
                    <div className="h-20 bg-gray-800 rounded-3xl w-full"></div>
                  </div>
                ))}
              </div>
            ) : insights ? (
              <>
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Resumo Estratégico</span>
                  <p className="text-sm text-gray-300 leading-relaxed font-medium italic border-l-2 border-indigo-500 pl-4 py-1">
                    "{insights.summary}"
                  </p>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Alertas de Risco</span>
                  <div className="space-y-3">
                    {insights.alerts.map((alert, i) => (
                      <div key={i} className="flex items-start space-x-3 bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl">
                        <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-rose-200 leading-snug">{alert}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Oportunidades</span>
                  <div className="space-y-3">
                    {insights.opportunities.map((op, i) => (
                      <div key={i} className="flex items-start space-x-3 bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl">
                        <TrendingUp size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-emerald-200 leading-snug">{op}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <AlertCircle size={32} className="mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest">Aguardando dados para análise...</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-800/50">
            <button className="w-full py-4 bg-gray-900 border border-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white hover:bg-gray-800 transition-all">
              Gerar Relatório Completo PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
