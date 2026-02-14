
import { Company, Campaign, DailyMetrics, User, UserRole, Task, TaskStage } from "../types";

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alexandre Silva',
  email: 'alexandre@agencianexus.com',
  role: UserRole.ADMIN
};

export const MOCK_CLIENT_USER: User = {
  id: 'u2',
  name: 'Clara Rodrigues',
  email: 'clara@lojaexemplo.com',
  role: UserRole.CLIENT,
  companyId: 'c1'
};

export const MOCK_COMPANIES: Company[] = [
  { id: 'c1', name: 'Loja Exemplo Fashion', plan: 'Pro', startDate: '2023-01-15', activeCampaigns: 4 },
  { id: 'c2', name: 'Tech Solutions SA', plan: 'Enterprise', startDate: '2023-05-20', activeCampaigns: 7 },
  { id: 'c3', name: 'Gastro Hub', plan: 'Basic', startDate: '2023-08-10', activeCampaigns: 2 },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'cp1', companyId: 'c1', platform: 'Meta', name: 'Coleção Inverno - Lookalike 1%', budget: 5000, status: 'ACTIVE' },
  { id: 'cp2', companyId: 'c1', platform: 'Meta', name: 'Retargeting Carrinho', budget: 1500, status: 'ACTIVE' },
  { id: 'cp3', companyId: 'c1', platform: 'Google', name: 'Search - Vestidos Femininos', budget: 3000, status: 'ACTIVE' },
];

export const MOCK_METRICS: DailyMetrics[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    spend: 150 + Math.random() * 50,
    impressions: 10000 + Math.random() * 5000,
    clicks: 200 + Math.random() * 100,
    leads: 10 + Math.random() * 5,
    conversions: 2 + Math.random() * 3,
    revenue: 800 + Math.random() * 400
  };
});

export const MOCK_TASKS: Task[] = [
  { id: 't1', companyId: 'c1', title: 'Aprovação de Criativos - Campanha Verão', stage: TaskStage.APPROVAL, assignee: 'Luan Torres', dueDate: '2024-06-15', status: 'TODO', description: 'Revisar artes enviadas pelo design.' },
  { id: 't2', companyId: 'c1', title: 'Configuração de Pixel', stage: TaskStage.PUBLISHING, assignee: 'Ana Clara', dueDate: '2024-06-12', status: 'DOING', description: 'Instalar GTM no site do cliente.' },
  { id: 't3', companyId: 'c1', title: 'Briefing Mensal', stage: TaskStage.BRIEFING, assignee: 'Alexandre Silva', dueDate: '2024-06-10', status: 'DONE', description: 'Reunião de alinhamento estratégico.' },
];
