
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Menu, 
  X, 
  Plus,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Users,
  Kanban,
  BarChart3,
  Megaphone,
  LayoutDashboard
} from 'lucide-react';
import { User, UserRole } from './types';
import { authService } from './services/authService';
import { dbService } from './services/dbService';

// Pages
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import CRM from './pages/CRM';
import CampaignsPage from './pages/CampaignsPage';
import LoginPage from './pages/LoginPage';
import ReportsPage from './pages/ReportsPage';
import UserManagement from './pages/UserManagement';

const Sidebar: React.FC<{ user: User, isOpen: boolean, toggle: () => void, onLogout: () => void }> = ({ user, isOpen, toggle, onLogout }) => {
  const location = useLocation();
  const isClient = user.role === UserRole.CLIENT;

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, show: true },
    { label: 'Carteira de Clientes', path: '/crm', icon: <Users size={20} />, show: !isClient },
    { label: 'Gestão de Anúncios', path: '/campaigns', icon: <Megaphone size={20} />, show: true },
    { label: 'Fluxo de Projetos', path: '/kanban', icon: <Kanban size={20} />, show: true },
    { label: 'Relatórios BI', path: '/reports', icon: <BarChart3 size={20} />, show: true },
    { label: 'Usuários & Acessos', path: '/settings/users', icon: <ShieldCheck size={20} />, show: user.role === UserRole.ADMIN },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0b0f1a] border-r border-gray-800 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="p-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-gray-950 text-xl shadow-lg shadow-emerald-500/20">M</div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-white leading-none">MARKETING</span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">MONEY AGENCY</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {menuItems.filter(i => i.show).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { if(window.innerWidth < 1024) toggle(); }}
                className={`flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all group ${
                  isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                  : 'text-gray-500 hover:bg-gray-800/40 hover:text-gray-200'
                }`}
              >
                <span className={`${isActive ? 'text-emerald-400' : 'text-gray-600 group-hover:text-emerald-400'} transition-colors`}>{item.icon}</span>
                <span className="font-bold text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800/50 bg-gray-950/30">
          <div className="flex items-center p-4 rounded-2xl border border-gray-800 bg-gray-900/40">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-sm font-black text-gray-950">
              {user.name?.charAt(0)}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-white truncate leading-none mb-1">{user.name}</p>
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{user.role}</p>
            </div>
            <button onClick={onLogout} className="ml-auto text-gray-600 hover:text-rose-500 p-2 transition-colors"><LogOut size={18} /></button>
          </div>
        </div>
      </div>
    </aside>
  );
};

const Header: React.FC<{ title: string, toggleSidebar: () => void, user: User }> = ({ title, toggleSidebar, user }) => {
  const navigate = useNavigate();
  return (
    <header className="h-20 bg-[#030712]/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="lg:hidden mr-6 text-gray-400 hover:text-white bg-gray-900 p-2 rounded-xl border border-gray-800">
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-black text-white tracking-tight uppercase border-l-4 border-emerald-500 pl-4">{title}</h1>
      </div>
      {user.role !== UserRole.CLIENT && (
        <button onClick={() => navigate('/crm')} className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20">
          <Plus size={16} />
          <span>Cadastrar Cliente</span>
        </button>
      )}
    </header>
  );
};

const PageWrapper: React.FC<{ children: React.ReactNode, title: string, toggleSidebar: () => void, user: User }> = ({ children, title, toggleSidebar, user }) => {
  return (
    <>
      <Header title={title} toggleSidebar={toggleSidebar} user={user} />
      <div className="p-8 max-w-[1600px] mx-auto w-full">{children}</div>
    </>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges(async (fbUser) => {
      try {
        if (fbUser) {
          const profile = await dbService.getUserProfile(fbUser.uid);
          setCurrentUser(profile || {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0],
            email: fbUser.email,
            role: UserRole.TEAM
          });
        } else { setCurrentUser(null); }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  );

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
            <Sidebar user={currentUser} isOpen={isSidebarOpen} toggle={toggleSidebar} onLogout={() => authService.logout()} />
            <main className="lg:ml-72 min-h-screen">
              <Routes>
                <Route path="/" element={<PageWrapper title="Visão Geral" toggleSidebar={toggleSidebar} user={currentUser}><Dashboard user={currentUser} /></PageWrapper>} />
                <Route path="/crm" element={<PageWrapper title="Carteira de Clientes" toggleSidebar={toggleSidebar} user={currentUser}><CRM /></PageWrapper>} />
                <Route path="/kanban" element={<PageWrapper title="Fluxo Operacional" toggleSidebar={toggleSidebar} user={currentUser}><KanbanBoard user={currentUser} /></PageWrapper>} />
                <Route path="/campaigns" element={<PageWrapper title="Gestão de Anúncios" toggleSidebar={toggleSidebar} user={currentUser}><CampaignsPage /></PageWrapper>} />
                <Route path="/reports" element={<PageWrapper title="Relatórios de BI" toggleSidebar={toggleSidebar} user={currentUser}><ReportsPage /></PageWrapper>} />
                <Route path="/settings/users" element={<PageWrapper title="Controle de Acessos" toggleSidebar={toggleSidebar} user={currentUser}><UserManagement /></PageWrapper>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;
