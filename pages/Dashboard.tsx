
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  DollarSign, 
  Lightbulb, 
  AlertCircle,
  ArrowUpRight
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
import { User, UserRole, AIInsight } from '../types';
import { MOCK_METRICS } from '../services/mockData';
import { generateMarketingInsights } from '../services/geminiService';

const StatCard = ({ title, value, change, suffix = "", icon: Icon }: any) => (
  <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-indigo-600/10 rounded-xl text-indigo-500">
        <Icon size={24} />
      </div>
      <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${change >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
        {change >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
        {Math.abs(change)}%
      </div>
    </div>
    <p className="text-gray-400 text-sm mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-white">
      {suffix === 'R$' ? `R$ ${value.toLocaleString('pt-BR')}` : value.toLocaleString('pt-BR')}
      <span className="text-sm font-normal text-gray-500 ml-1">{suffix !== 'R$' && suffix}</span>
    </h3>
  </div>
);

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true);
      const res = await generateMarketingInsights(MOCK_METRICS);
      setInsights(res);
      setLoadingInsights(false);
    };
    fetchInsights();
  }, []);

  const totalSpend = MOCK_METRICS.reduce((acc, m) => acc + m.spend, 0);
  const totalLeads = MOCK_METRICS.reduce((acc, m) => acc + m.leads, 0);
  const totalRevenue = MOCK_METRICS.reduce((acc, m) => acc + m.revenue, 0);
  const roas = totalRevenue / totalSpend;

  const isClient = user.role === UserRole.CLIENT;

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Investimento Total" value={totalSpend} suffix="R$" change={12} icon={DollarSign} />
        <StatCard title="Leads Gerados" value={Math.floor(totalLeads)} change={8} icon={Users} />
        <StatCard title="ROAS Médio" value={roas.toFixed(2)} suffix="x" change={-3} icon={Target} />
        <StatCard title="Receita Atribuída" value={totalRevenue} suffix="R$" change={15} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white">Performance Temporal</h3>
              <p className="text-sm text-gray-500">Evolução de gastos vs leads nos últimos 30 dias</p>
            </div>
            <select className="bg-gray-800 border-none rounded-lg text-sm text-white px-3 py-1.5 focus:ring-2 focus:ring-indigo-500">
              <option>Últimos 30 dias</option>
              <option>Últimos 7 dias</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_METRICS}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="spend" stroke="#6366f1" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 overflow-hidden relative">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-1.5 bg-purple-600/20 rounded-lg text-purple-400">
              <Lightbulb size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Insights da Nexus AI</h3>
          </div>

          {loadingInsights ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              <div className="h-4 bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-800 rounded w-5/6"></div>
              <div className="h-20 bg-gray-800 rounded w-full"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {insights?.summary || "Analisando dados das campanhas..."}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                  <AlertCircle size={14} className="mr-2 text-amber-500" />
                  Alertas Críticos
                </h4>
                {insights?.alerts.map((alert, i) => (
                  <div key={i} className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl text-sm text-amber-200">
                    {alert}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                  <ArrowUpRight size={14} className="mr-2 text-emerald-500" />
                  Oportunidades
                </h4>
                {insights?.opportunities.map((op, i) => (
                  <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl text-sm text-emerald-200">
                    {op}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!isClient && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Platforms */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Conversão por Plataforma</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Meta Ads', value: 45 },
                  { name: 'Google Ads', value: 30 },
                  { name: 'TikTok Ads', value: 25 },
                ]}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    <Cell fill="#6366f1" />
                    <Cell fill="#a855f7" />
                    <Cell fill="#f43f5e" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions / Recent Events */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Atividade Recente</h3>
            <div className="space-y-4">
              {[
                { title: 'Novo lead qualificado', time: '12 min atrás', desc: 'Loja Exemplo Fashion' },
                { title: 'Campanha pausada', time: '2 horas atrás', desc: 'Gastro Hub - Verão 24' },
                { title: 'Relatório mensal gerado', time: '5 horas atrás', desc: 'Tech Solutions SA' },
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <div className="w-2 h-2 mt-2 bg-indigo-500 rounded-full"></div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.desc} • {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
