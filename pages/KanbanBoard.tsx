
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { TaskStage, Task, User, UserRole } from '../types';
import { MOCK_TASKS } from '../services/mockData';
import { dbService } from '../services/dbService';

const STAGES = [
  { id: TaskStage.BRIEFING, label: 'Briefing', color: 'bg-blue-500' },
  { id: TaskStage.CREATION, label: 'Criação', color: 'bg-purple-500' },
  { id: TaskStage.APPROVAL, label: 'Aprovação', color: 'bg-amber-500' },
  { id: TaskStage.PUBLISHING, label: 'Publicação', color: 'bg-indigo-500' },
  { id: TaskStage.OPTIMIZATION, label: 'Otimização', color: 'bg-emerald-500' },
  { id: TaskStage.REPORT, label: 'Relatório', color: 'bg-slate-500' },
];

const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
  <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-700 hover:border-gray-500 transition-all cursor-grab active:cursor-grabbing group">
    <div className="flex items-center justify-between mb-3">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
        task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-400'
      }`}>
        {task.status}
      </span>
      <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreHorizontal size={16} />
      </button>
    </div>
    <h4 className="text-sm font-semibold text-white mb-2 leading-tight">{task.title}</h4>
    <p className="text-xs text-gray-400 mb-4 line-clamp-2">{task.description}</p>
    
    <div className="flex items-center justify-between pt-3 border-t border-gray-700">
      <div className="flex -space-x-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-[#1f2937] flex items-center justify-center text-[10px] font-bold">
          {task.assignee.charAt(0)}
        </div>
      </div>
      <div className="flex items-center space-x-1 text-gray-500">
        <Clock size={12} />
        <span className="text-[10px] font-medium">{new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
      </div>
    </div>
  </div>
);

const KanbanBoard: React.FC<{ user: User }> = ({ user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
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
    companyId: 'default'
  });

  const fetchTasks = async () => {
    setLoading(true);
    const data = await dbService.getTasks();
    setTasks(data.length > 0 ? data : MOCK_TASKS);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dbService.addTask(newTask);
      await fetchTasks();
      setIsModalOpen(false);
      setNewTask({ ...newTask, title: '', description: '' });
    } catch (error) {
      alert("Erro ao salvar tarefa no Firestore.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-white">Fluxo de Operação</h2>
          <p className="text-sm text-gray-500">Acompanhe as etapas de produção e otimização</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={fetchTasks} className="p-2 text-gray-400 hover:text-white transition-colors">
            <Loader2 className={loading ? "animate-spin" : ""} size={20} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Criar Task</span>
          </button>
        </div>
      </div>

      {loading && tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>Carregando cronograma...</p>
        </div>
      ) : (
        <div className="flex overflow-x-auto pb-6 space-x-6 min-h-[600px] snap-x">
          {STAGES.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80 snap-start">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
                  <h3 className="font-bold text-gray-300 text-sm uppercase tracking-widest">{stage.label}</h3>
                  <span className="bg-gray-800 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {tasks.filter(t => t.stage === stage.id).length}
                  </span>
                </div>
              </div>
              
              <div className="bg-[#111827]/40 border border-gray-800/50 rounded-2xl p-3 space-y-3 min-h-[500px]">
                {tasks.filter(t => t.stage === stage.id).map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                
                <button 
                  onClick={() => {
                    setNewTask({...newTask, stage: stage.id});
                    setIsModalOpen(true);
                  }}
                  className="w-full py-2 border border-dashed border-gray-800 rounded-xl text-xs text-gray-500 hover:border-gray-700 hover:text-gray-400 transition-all flex items-center justify-center"
                >
                  <Plus size={14} className="mr-2" />
                  Adicionar Card
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Nova Task */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Nova Tarefa</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Título da Tarefa</label>
                <input 
                  required
                  type="text" 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                  placeholder="Ex: Criar artes para Black Friday"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Descrição</label>
                <textarea 
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white h-24 resize-none"
                  placeholder="Detalhes da entrega..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Etapa</label>
                  <select 
                    value={newTask.stage}
                    onChange={e => setNewTask({...newTask, stage: e.target.value as any})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                  >
                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Prazo</label>
                  <input 
                    type="date" 
                    value={newTask.dueDate}
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button 
                  disabled={isSaving}
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <span>Criar Tarefa</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
