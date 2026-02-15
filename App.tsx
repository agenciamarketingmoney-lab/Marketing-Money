
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Menu, 
  X, 
  Bell,
  Plus,
  Loader2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { NAV_ITEMS } from './constants';
import { User, UserRole } from './types';
import { authService } from './services/authService';
import { dbService } from './services/dbService';

// Pages
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import CRM from './pages/CRM';
import CampaignsPage from './pages/CampaignsPage';
import LoginPage from './pages/LoginPage';

const Sidebar: React.FC<{ user: User, isOpen: boolean, toggle: () => void, onLogout: () => void }> = ({ user, isOpen, toggle, onLogout }) => {
  const location = useLocation();

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0b0f1a] border-r border-gray-800 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white shadow-xl shadow-indigo-600/20">N</div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white leading-none">NEXUS</span>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Intelligence</span>
            </div>
          </div>
          <button onClick={toggle} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-6">
          {NAV_ITEMS.filter(item => item.roles.includes(user.role)).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { if(window.innerWidth < 1024) toggle(); }}
                className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                  isActive 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' 
                  : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <span className={`${isActive ? 'text-indigo-500' : 'text-gray-600 group-hover:text-gray-400'}`}>
                  {item.icon}
                </span>
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800/50">
          <div className="flex items-center p-3 rounded-2xl bg-gray-900/40 border border-gray-800/50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-black text-white shadow-lg">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-white truncate leading-none mb-1">{user.name || 'Usuário'}</p>
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{user.role}</p>
            </div>
            <button 
              onClick={onLogout}
              className="ml-auto text-gray-600 hover:text-rose-500 p-2 transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

const Header: React.FC<{ title: string, toggleSidebar: () => void }> = ({ title, toggleSidebar }) => {
  const navigate = useNavigate();
  return (
    <header className="h-20 bg-[#030712]/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="lg:hidden mr-6 text-gray-400 hover:text-white bg-gray-900 p-2 rounded-xl border border-gray-800">
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center space-x-1.5 px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-full">
           <Zap size={14} className="text-indigo-500" />
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nexus Pro Cloud</span>
        </div>
        
        <div className="flex items-center space-x-3 border-l border-gray-800 pl-6">
          <button className="relative p-2.5 bg-gray-900 border border-gray-800 text-gray-400 hover:text-indigo-400 rounded-xl transition-all">
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#030712]"></span>
          </button>
          <button 
            onClick={() => navigate('/crm')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center space-x-2 shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Novo Cliente</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const PageWrapper: React.FC<{ children: React.ReactNode, title: string, toggleSidebar: () => void }> = ({ children, title, toggleSidebar }) => {
  return (
    <>
      <Header title={title} toggleSidebar={toggleSidebar} />
      <div className="p-8 max-w-[1440px] mx-auto w-full">
        {children}
      </div>
    </>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges(async (fbUser) => {
      try {
        if (fbUser) {
          const profile = await dbService.getUserProfile(fbUser.uid);
          if (profile) {
            setCurrentUser(profile);
          } else {
            setCurrentUser({
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuário Nexus',
              email: fbUser.email || '',
              role: fbUser.email === 'alexandre@agencianexus.com' ? UserRole.ADMIN : UserRole.TEAM
            });
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Erro ao sincronizar usuário:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-gray-500">
        <div className="relative mb-8">
           <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
           <div className="absolute inset-0 flex items-center justify-center font-black text-indigo-500">N</div>
        </div>
        <p className="text-[10px] font-black tracking-[0.4em] uppercase text-indigo-400/50 animate-pulse">Sincronizando Nexus Core...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#030712]">
        {!currentUser ? (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <>
            <Sidebar user={currentUser} isOpen={isSidebarOpen} toggle={toggleSidebar} onLogout={handleLogout} />
            <main className="lg:ml-64 min-h-screen flex flex-col">
              <Routes>
                <Route path="/" element={<PageWrapper title="Visão Estratégica" toggleSidebar={toggleSidebar}><Dashboard user={currentUser} /></PageWrapper>} />
                <Route path="/crm" element={<PageWrapper title="Gestão de Clientes" toggleSidebar={toggleSidebar}><CRM /></PageWrapper>} />
                <Route path="/kanban" element={<PageWrapper title="Cronograma Operacional" toggleSidebar={toggleSidebar}><KanbanBoard user={currentUser} /></PageWrapper>} />
                <Route path="/campaigns" element={<PageWrapper title="Performance de Tráfego" toggleSidebar={toggleSidebar}><CampaignsPage /></PageWrapper>} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="*" element={<PageWrapper title="Configurações" toggleSidebar={toggleSidebar}><div className="p-20 text-center flex flex-col items-center"><Zap size={40} className="text-gray-800 mb-4" /><p className="text-gray-500 font-bold">Módulo de configurações avançadas em expansão.</p></div></PageWrapper>} />
              </Routes>
            </main>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;
