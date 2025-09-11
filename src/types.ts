export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  completed_at?: string;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  server: string;
  tasks_count: number;
  auth_enabled: boolean;
}

export interface AuthContext {
  isAuthenticated: boolean;
  token?: string;
}