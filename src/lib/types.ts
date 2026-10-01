export type UserRole = 'ADM' | 'FUNCIONARIO';

export interface User {
  id: string;
  username: string; // Nome de usuário simplificado
  name: string;
  email?: string;
  role: UserRole;
  department: string;
  active: number; // 1 = active, 0 = inactive
  created_at: string;
}

export type PaymentType = 'Particular' | 'Convênio';

export type ClientStatus =
  | 'Aguardando Atendimento'
  | 'Em Coleta'
  | 'Em Análise'
  | 'Laudo Pronto'
  | 'Concluído';

export interface Client {
  id: string;
  user_id: string;
  user_name?: string; // Colaborador que cadastrou
  user_username?: string;
  name: string;
  cpf: string;
  rg?: string;
  birth_date?: string;
  gender?: string;
  phone: string;
  email?: string;
  zip_code?: string;
  address?: string;
  city?: string;
  state?: string;
  payment_type: PaymentType;
  health_insurance_name?: string;
  insurance_card_number?: string;
  requested_exams: string;
  doctor_request?: string;
  clinical_notes?: string;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
}

export interface EmployeeMetrics {
  user: User;
  total_clients: number;
  week_clients: number;
  month_clients: number;
}

export interface DashboardMetrics {
  totalClients: number;
  todayClients: number;
  weekClients: number;
  monthClients: number;
  clientsPerDay: { date: string; label: string; count: number }[];
  clientsPerEmployee: { name: string; username: string; count: number; weekCount: number; monthCount: number }[];
  paymentDistribution: { type: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
}
