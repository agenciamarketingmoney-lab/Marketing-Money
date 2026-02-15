
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
  Zap,
  ShieldCheck
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
import ReportsPage from './pages/ReportsPage';
import UserManagement from './pages/UserManagement';

const Sidebar: React.FC<{ user: User, isOpen: boolean, toggle: () => void, onLogout: () => void }> = ({ user, isOpen, toggle, onLogout }) => {
  const location = useLocation();

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0b0f1a] border-r border-gray-800 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white">N</div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white">NEXUS</span>
              <span className="text-[10px] font-black text-indigo-500 uppercase">Intelligence</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-6">
          {NAV_ITEMS.filter(item => item.roles.includes(user.role)).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { if(window.innerWidth < 1024) toggle(); }}
                className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all ${
                  isActive 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' 
                  : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                {item.icon}
                <span className="font-bold text-sm">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Item Extra: Gestão de Usuários apenas para Admin */}
          {user.role === UserRole.ADMIN && (
            <Link
              to="/settings/users"
              className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all ${
                location.pathname === '/settings/users' 
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' 
                : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-200'
              }`}
            >
              <ShieldCheck size={20} />
              <span className="font-bold text-sm">Usuários & Acessos</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800/50">
          <div className="flex items-center p-3 rounded-2xl bg-gray-900/40 border border-gray-800/50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-black text-white uppercase">
              {user.name?.charAt(0)}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-white truncate leading-none mb-1">{user.name}</p>
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{user.role}</p>
            </div>
            <button onClick={onLogout} className="ml-auto text-gray-600 hover:text-rose-500 p-2"><LogOut size={18} /></button>
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
        <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>
      </div>
      {user.role !== UserRole.CLIENT && (
        <button onClick={() => navigate('/crm')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center space-x-2">
          <Plus size={16} />
          <span>Novo Cliente</span>
        </button>
      )}
    </header>
  );
};

const PageWrapper: React.FC<{ children: React.ReactNode, title: string, toggleSidebar: () => void, user: User }> = ({ children, title, toggleSidebar, user }) => {
  return (
    <>
      <Header title={title} toggleSidebar={toggleSidebar} user={user} />
      <div className="p-8 max-w-[1440px] mx-auto w-full">{children}</div>
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
      <div className="w-12 h-12 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
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
            <main className="lg:ml-64 min-h-screen">
              <Routes>
                <Route path="/" element={<PageWrapper title="Dashboard" toggleSidebar={toggleSidebar} user={currentUser}><Dashboard user={currentUser} /></PageWrapper>} />
                <Route path="/crm" element={<PageWrapper title="CRM" toggleSidebar={toggleSidebar} user={currentUser}><CRM /></PageWrapper>} />
                <Route path="/kanban" element={<PageWrapper title="Kanban" toggleSidebar={toggleSidebar} user={currentUser}><KanbanBoard user={currentUser} /></PageWrapper>} />
                <Route path="/campaigns" element={<PageWrapper title="Campanhas" toggleSidebar={toggleSidebar} user={currentUser}><CampaignsPage /></PageWrapper>} />
                <Route path="/reports" element={<PageWrapper title="Relatórios" toggleSidebar={toggleSidebar} user={currentUser}><ReportsPage /></PageWrapper>} />
                <Route path="/settings/users" element={<PageWrapper title="Usuários" toggleSidebar={toggleSidebar} user={currentUser}><UserManagement /></PageWrapper>} />
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
