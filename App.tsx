import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LogOut, 
  Menu, 
  X, 
  Bell,
  Plus,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { NAV_ITEMS } from './constants';
import { User, UserRole } from './types';
import { authService } from './services/authService';

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
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">N</div>
            <span className="text-xl font-bold tracking-tight text-white">NEXUS</span>
          </div>
          <button onClick={toggle} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {NAV_ITEMS.filter(item => item.roles.includes(user.role)).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                  ? 'bg-indigo-600/10 text-indigo-400' 
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <span className={`${isActive ? 'text-indigo-500' : 'text-gray-500 group-hover:text-gray-300'}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center p-2 rounded-xl bg-gray-900/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user.name || 'Usuário'}</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{user.role}</p>
            </div>
            <button 
              onClick={onLogout}
              className="ml-auto text-gray-500 hover:text-rose-400 p-2 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

const Header: React.FC<{ title: string, toggleSidebar: () => void }> = ({ title, toggleSidebar }) => (
  <header className="h-16 bg-[#030712]/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40 flex items-center justify-between px-6">
    <div className="flex items-center">
      <button onClick={toggleSidebar} className="lg:hidden mr-4 text-gray-400 hover:text-white">
        <Menu size={24} />
      </button>
      <h1 className="text-xl font-bold text-white">{title}</h1>
    </div>
    <div className="flex items-center space-x-4">
      <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
        <Bell size={20} />
        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#030712]"></span>
      </button>
      <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all">
        <Plus size={18} />
        <span className="hidden sm:inline">Ação Rápida</span>
      </button>
    </div>
  </header>
);

const PageWrapper: React.FC<{ children: React.ReactNode, title: string, toggleSidebar: () => void }> = ({ children, title, toggleSidebar }) => {
  return (
    <>
      <Header title={title} toggleSidebar={toggleSidebar} />
      <div className="p-6 max-w-7xl mx-auto w-full">
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
    // Timeout de segurança: se o Firebase não responder em 8s, libera o loading para mostrar a tela de login
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn("Nexus: Firebase demorou muito para responder. Liberando loading...");
        setLoading(false);
      }
    }, 8000);

    try {
      const unsubscribe = authService.subscribeToAuthChanges((firebaseUser) => {
        clearTimeout(safetyTimeout);
        if (firebaseUser) {
          setCurrentUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Gestor',
            email: firebaseUser.email || '',
            role: UserRole.ADMIN
          });
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });

      return () => {
        unsubscribe();
        clearTimeout(safetyTimeout);
      };
    } catch (err) {
      console.error("Erro ao inicializar Auth:", err);
      setError("Falha na conexão com o servidor de autenticação.");
      setLoading(false);
      clearTimeout(safetyTimeout);
    }
  }, []);

  const handleLogout = async () => {
    await authService.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
        <p className="text-sm font-medium tracking-widest uppercase animate-pulse">Sincronizando Nexus...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-rose-400 p-6 text-center">
        <AlertTriangle size={48} className="mb-4" />
        <h2 className="text-xl font-bold mb-2">Erro Crítico</h2>
        <p className="max-w-md opacity-80">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-gray-800 rounded-lg text-white font-bold hover:bg-gray-700 transition-colors"
        >
          Tentar Novamente
        </button>
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
            <Sidebar 
              user={currentUser} 
              isOpen={isSidebarOpen} 
              toggle={toggleSidebar} 
              onLogout={handleLogout}
            />
            <main className="lg:ml-64 min-h-screen flex flex-col">
              <Routes>
                <Route path="/" element={<PageWrapper title="Dashboard" toggleSidebar={toggleSidebar}><Dashboard user={currentUser} /></PageWrapper>} />
                <Route path="/crm" element={<PageWrapper title="CRM & Clientes" toggleSidebar={toggleSidebar}><CRM /></PageWrapper>} />
                <Route path="/kanban" element={<PageWrapper title="Gestão de Projetos" toggleSidebar={toggleSidebar}><KanbanBoard user={currentUser} /></PageWrapper>} />
                <Route path="/campaigns" element={<PageWrapper title="Campanhas de Tráfego" toggleSidebar={toggleSidebar}><CampaignsPage /></PageWrapper>} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="*" element={<PageWrapper title="Em Breve" toggleSidebar={toggleSidebar}><div className="p-10 text-center text-gray-500">Módulo em desenvolvimento...</div></PageWrapper>} />
              </Routes>
            </main>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;