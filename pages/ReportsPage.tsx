
import React, { useState, useEffect } from 'react';
import { BarChart3, Download, FileText, Calendar, Filter, ChevronRight, TrendingUp } from 'lucide-react';
import { dbService } from '../services/dbService';
import { DailyMetrics, Company } from '../types';

const ReportsPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const comps = await dbService.getCompanies();
      setCompanies(comps);
      const data = await dbService.getMetrics(selectedCompanyId === 'all' ? undefined : selectedCompanyId);
      setMetrics(data);
      setLoading(false);
    };
    load();
  }, [selectedCompanyId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Relatórios BI</h2>
          <p className="text-sm text-gray-500">Exportação de performance e auditoria de dados</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="bg-[#111827] border border-gray-800 text-white text-xs font-bold rounded-xl px-4 py-2.5 outline-none"
          >
            <option value="all">Todos os Clientes</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
            <Download size={16} />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-gray-800 bg-gray-900/20">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center">
            <FileText size={18} className="mr-2 text-indigo-500" />
            Performance Diária Detalhada
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                <th className="px-8 py-5">Data</th>
                <th className="px-8 py-5">Investimento</th>
                <th className="px-8 py-5">Leads</th>
                <th className="px-8 py-5">CPL</th>
                <th className="px-8 py-5">Conversão</th>
                <th className="px-8 py-5">Receita</th>
                <th className="px-8 py-5 text-right">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {metrics.length > 0 ? metrics.map((m, i) => {
                const cpl = m.leads > 0 ? m.spend / m.leads : 0;
                const roi = m.spend > 0 ? (m.revenue / m.spend).toFixed(2) : '0.00';
                return (
                  <tr key={i} className="hover:bg-gray-800/20 transition-all group">
                    <td className="px-8 py-5 text-xs font-bold text-gray-400">{m.date}</td>
                    <td className="px-8 py-5 text-xs font-bold text-white">R$ {m.spend.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-indigo-400">{Math.floor(m.leads)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-gray-400">R$ {cpl.toFixed(2)}</td>
                    <td className="px-8 py-5 text-xs font-bold text-gray-400">{((m.conversions/m.clicks)*100).toFixed(1)}%</td>
                    <td className="px-8 py-5 text-xs font-bold text-white">R$ {m.revenue.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${Number(roi) > 2 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {roi}x
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">
                    Nenhum dado disponível para o filtro selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
