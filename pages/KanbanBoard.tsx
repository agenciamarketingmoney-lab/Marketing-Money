
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  Loader2,
  X,
  Briefcase
} from 'lucide-react';
import { TaskStage, Task, User, UserRole, Company } from '../types';
import { dbService } from '../services/dbService';

const STAGES = [
  { id: TaskStage.BRIEFING, label: 'Briefing', color: 'bg-blue-500' },
  { id: TaskStage.CREATION, label: 'Criação', color: 'bg-purple-500' },
  { id: TaskStage.APPROVAL, label: 'Aprovação', color: 'bg-amber-500' },
  { id: TaskStage.PUBLISHING, label: 'Publicação', color: 'bg-indigo-500' },
  { id: TaskStage.OPTIMIZATION, label: 'Otimização', color: 'bg-emerald-500' },
  { id: TaskStage.REPORT, label: 'Relatórios', color: 'bg-slate-500' },
];

const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
  <div className="bg-[#1f2937] p-5 rounded-2xl border border-gray-800 hover:border-indigo-500/40 transition-all cursor-grab active:cursor-grabbing group shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${
        task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-400'
      }`}>
        {task.status}
      </span>
      <button className="text-gray-600 hover:text-white transition-opacity">
        <MoreHorizontal size={16} />
      </button>
    </div>
    <h4 className="text-sm font-black text-white mb-2 leading-tight tracking-tight">{task.title}</h4>
    <p className="text-[11px] text-gray-500 mb-5 line-clamp-2 font-medium">{task.description}</p>
    
    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
      <div className="flex items-center space-x-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
          {task.assignee.charAt(0)}
        </div>
        <span className="text-[10px] text-gray-400 font-bold uppercase">{task.assignee.split(' ')[0]}</span>
      </div>
      <div className="flex items-center space-x-1.5 text-gray-600">
        <Clock size={12} />
        <span className="text-[10px] font-black uppercase tracking-tighter">{new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
      </div>
    </div>
  </div>
);

const KanbanBoard: React.FC<{ user: User }> = ({ user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const initialCompany = user.role === UserRole.CLIENT ? user.companyId : 'all';
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(initialCompany || 'all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    stage: TaskStage.BRIEFING,
    assignee: user.name,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'TODO' as const,
    companyId: initialCompany || ''
  });

  const fetchTasks = async () => {
    setLoading(true);
    const companyFilter = selectedCompanyId === 'all' ? undefined : selectedCompanyId;
    const [taskData, compData] = await Promise.all([
      dbService.getTasks(companyFilter),
      dbService.getCompanies(user)
    ]);
    setTasks(taskData);
    setCompanies(compData);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, [selectedCompanyId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.companyId) { alert("Selecione um cliente para vincular a tarefa."); return; }
    setIsSaving(true);
    try {
      await dbService.addTask(newTask);
      await fetchTasks();
      setIsModalOpen(false);
      setNewTask({ ...newTask, title: '', description: '' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Cronograma Operacional</h2>
          <p className="text-sm text-gray-500 font-medium">Fluxo de entregas e otimizações de conta</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {user.role !== UserRole.CLIENT && (
            <select 
              value={selectedCompanyId}
              onChange={(e) => {
                setSelectedCompanyId(e.target.value);
                setNewTask(prev => ({ ...prev, companyId: e.target.value === 'all' ? '' : e.target.value }));
              }}
              className="bg-[#111827] border border-gray-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-3 outline-none cursor-pointer shadow-xl focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">TODOS OS CLIENTES</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}

          <button 
            disabled={user.role === UserRole.CLIENT}
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Nova Task</span>
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-8 space-x-8 min-h-[70vh] snap-x scrollbar-hide">
        {STAGES.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80 snap-start">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center space-x-3">
                <div className={`w-2.5 h-2.5 rounded-full ${stage.color} shadow-lg shadow-${stage.color}/20`}></div>
                <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em]">{stage.label}</h3>
                <span className="bg-gray-800 text-gray-500 text-[10px] px-2 py-0.5 rounded-lg font-black">
                  {tasks.filter(t => t.stage === stage.id).length}
                </span>
              </div>
            </div>
            
            <div className="bg-[#111827]/40 border border-gray-800/50 rounded-[2.5rem] p-4 space-y-4 min-h-[500px]">
              {tasks.filter(t => t.stage === stage.id).length > 0 ? (
                tasks.filter(t => t.stage === stage.id).map(task => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-center opacity-20">
                   <Briefcase size={24} className="text-gray-600 mb-2" />
                   <p className="text-[9px] font-black uppercase tracking-widest">Nenhuma Tarefa</p>
                </div>
              )}
              
              {user.role !== UserRole.CLIENT && (
                <button 
                  onClick={() => {
                    setNewTask({...newTask, stage: stage.id});
                    setIsModalOpen(true);
                  }}
                  className="w-full py-4 border-2 border-dashed border-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:border-indigo-500/30 hover:text-indigo-400 transition-all flex items-center justify-center group"
                >
                  <Plus size={14} className="mr-2 group-hover:scale-125 transition-transform" />
                  Novo Card
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#111827] border border-gray-800 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Criar Operação</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateTask} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Título da Tarefa</label>
                <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" placeholder="Ex: Produzir Criativos de Natal" />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Vincular Cliente</label>
                <select required value={newTask.companyId} onChange={e => setNewTask({...newTask, companyId: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 text-sm text-white outline-none">
                  <option value="">Selecione um cliente...</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Etapa Atual</label>
                  <select value={newTask.stage} onChange={e => setNewTask({...newTask, stage: e.target.value as any})} className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 text-sm text-white">
                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Data de Entrega</label>
                  <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 text-sm text-white" />
                </div>
              </div>

              <button disabled={isSaving} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center transition-all">
                {isSaving ? <Loader2 className="animate-spin mr-2" size={20} /> : "PUBLICAR CARD"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
