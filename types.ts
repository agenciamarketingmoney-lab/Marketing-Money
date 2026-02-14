
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  TEAM = 'TEAM',
  CLIENT = 'CLIENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
}

export interface Company {
  id: string;
  name: string;
  plan: 'Basic' | 'Pro' | 'Enterprise';
  startDate: string;
  activeCampaigns: number;
}

export interface Campaign {
  id: string;
  companyId: string;
  platform: 'Meta' | 'Google' | 'TikTok';
  name: string;
  budget: number;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED';
}

export interface DailyMetrics {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
  revenue: number;
}

export interface CampaignMetrics extends DailyMetrics {
  campaignId: string;
}

export enum TaskStage {
  BRIEFING = 'BRIEFING',
  CREATION = 'CREATION',
  APPROVAL = 'APPROVAL',
  PUBLISHING = 'PUBLISHING',
  OPTIMIZATION = 'OPTIMIZATION',
  REPORT = 'REPORT'
}

export interface Task {
  id: string;
  companyId: string;
  title: string;
  stage: TaskStage;
  assignee: string;
  dueDate: string;
  status: 'TODO' | 'DOING' | 'DONE';
  description: string;
}

export interface AIInsight {
  summary: string;
  alerts: string[];
  opportunities: string[];
}
