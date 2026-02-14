
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Kanban, 
  BarChart3, 
  Settings, 
  Megaphone,
  Briefcase
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'MANAGER', 'TEAM', 'CLIENT'] },
  { label: 'Clientes', path: '/crm', icon: <Users size={20} />, roles: ['ADMIN', 'MANAGER', 'TEAM'] },
  { label: 'Campanhas', path: '/campaigns', icon: <Megaphone size={20} />, roles: ['ADMIN', 'MANAGER', 'TEAM'] },
  { label: 'Projetos', path: '/kanban', icon: <Kanban size={20} />, roles: ['ADMIN', 'MANAGER', 'TEAM', 'CLIENT'] },
  { label: 'Relatórios', path: '/reports', icon: <BarChart3 size={20} />, roles: ['ADMIN', 'MANAGER', 'TEAM', 'CLIENT'] },
  { label: 'Configurações', path: '/settings', icon: <Settings size={20} />, roles: ['ADMIN', 'MANAGER'] },
];

export const COLORS = {
  primary: '#6366f1',
  secondary: '#a855f7',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  bg: '#030712',
  card: '#111827',
};
