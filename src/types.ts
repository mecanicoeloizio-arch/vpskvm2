export type CallerRole = 'assinante' | 'tecnico' | 'cliente_final';

export interface AssistantInfo {
  name: string;
  chosenAt: string;
  personality: string;
  creator: string;
  group: string;
  currentGreeting: string;
  holiday: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  image?: {
    data: string;
    mimeType: string;
    previewUrl?: string;
  };
  modelUsed?: string;
}

export interface PartItem {
  code: string;
  name: string;
  category: string;
  stock: number;
  costPrice: string;
  salePrice: string;
  compatible: string;
}

export interface SubscriptionItem {
  subCode: string;
  clientName: string;
  owner: string;
  plan: string;
  dueInDays: number;
  status: 'AVISO_10_DIAS' | 'AVISO_5_DIAS' | 'AVISO_1_DIA' | 'EM_DIA' | 'BLOQUEADO';
  nextBillingNotice: string;
  actionRequired: string;
}

export interface OrderOfService {
  id: string;
  equipment: string;
  client: string;
  technician: string;
  status: string;
  problem: string;
}

export interface StackOption {
  id: string;
  name: string;
  category: 'mapos' | 'nodejs' | 'proxy' | 'security' | 'database';
  description: string;
  defaultPort: string;
  badge: string;
}
