
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  DollarSign, 
  Lightbulb, 
  AlertCircle,
  ArrowUpRight,
  ChevronDown,
  Filter,
  BarChart3
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { User, UserRole, AIInsight, Company, DailyMetrics } from '../types';
import { dbService } from '../services/dbService';
import { generateMarketingInsights } from '../services/geminiService';

const StatCard = ({ title, value, change, suffix = "", icon: Icon }: any) => (
  <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-indigo-600/10 rounded-xl text-indigo-500">
        <Icon size={24} />
      </div>
      {change !== undefined && (
        <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${change >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          {change >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <p className="text-gray-400 text-sm mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-white">
      {suffix === 'R$' ? `R$ ${value.toLocaleString('pt-BR')}` : value.toLocaleString('pt-BR')}
      <span className="text-sm font-normal text-gray-500 ml-1">{suffix !== 'R$' && suffix}</span>
    </h3>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 text-gray-700">
      <BarChart3 size={32} />
    </div>
    <p className="text-gray-500 text-sm max-w-xs">{message}</p>
  </div>
);

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(user.companyId || 'all');
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
        const data = await dbService.getCompanies();
        setCompanies(data);
      }
    };
    init();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const companyFilter = selectedCompanyId === 'all' ? undefined : selectedCompanyId;
      const data = await dbService.getMetrics(companyFilter);
      setMetrics(data);
      setLoading(false);

      if (data.length > 0) {
        setLoadingInsights(true);
        const res = await generateMarketingInsights(data);
        setInsights(res);
        setLoadingInsights(false);
      } else {
        setInsights(null);
      }
    };
    fetchData();
  }, [selectedCompanyId]);

  const totalSpend = metrics.reduce((acc, m) => acc + m.spend, 0);
  const totalLeads = metrics.reduce((acc, m) => acc + m.leads, 0);
  const totalRevenue = metrics.reduce((acc, m) => acc + m.revenue, 0);
  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;

  return (
    <div className="space-y-8">
      {/* Selector Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {selectedCompanyId === 'all' ? 'Consolidado da Agência' : companies.find(c => c.id === selectedCompanyId)?.name}
          </h2>
          <p className="text-gray-500 text-sm">Performance baseada em dados reais do Firestore</p>
        </div>

        {isAdmin && (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <select 
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="bg-[#111827] border border-gray-800 text-white text-sm rounded-xl pl-10 pr-10 py-2.5 appearance-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none cursor-pointer min-w-[200px]"
              >
                <option value="all">Todos os Clientes</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
            </div>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Investimento" value={totalSpend} suffix="R$" icon={DollarSign} />
        <StatCard title="Leads Gerados" value={Math.floor(totalLeads)} icon={Users} />
        <StatCard title="ROAS Médio" value={roas.toFixed(2)} suffix="x" icon={Target} />
        <StatCard title="Faturamento" value={totalRevenue} suffix="R$" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white">Curva de Performance</h3>
              <p className="text-sm text-gray-500">Dados diários de investimento vs retorno</p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : metrics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10}} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="spend" stroke="#6366f1" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Sem dados de métricas para este cliente. Integre uma conta de anúncios para começar." />
            )}
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 overflow-hidden relative">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
              <Lightbulb size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Nexus Intelligence</h3>
          </div>

          {loadingInsights ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              <div className="h-4 bg-gray-800 rounded w-full"></div>
              <div className="h-20 bg-gray-800 rounded w-full"></div>
            </div>
          ) : insights ? (
            <div className="space-y-6">
              <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-indigo-500 pl-4 py-1 italic">
                "{insights.summary}"
              </p>

              {insights.alerts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                    <AlertCircle size={14} className="mr-2 text-rose-500" />
                    Pontos de Atenção
                  </h4>
                  {insights.alerts.map((alert, i) => (
                    <div key={i} className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl text-xs text-rose-200 leading-relaxed">
                      {alert}
                    </div>
                  ))}
                </div>
              )}

              {insights.opportunities.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                    <ArrowUpRight size={14} className="mr-2 text-emerald-500" />
                    Plano de Escala
                  </h4>
                  {insights.opportunities.map((op, i) => (
                    <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl text-xs text-emerald-200 leading-relaxed">
                      {op}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <EmptyState message="Aguardando dados suficientes para gerar análise estratégica via IA." />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
