export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
  created_at: string;
  completed_at?: string;
  deadline?: string;
  assigned_to?: string;
  conductor_id?: string;
  personas?: {
    name: string;
    role: string;
  } | null;
}

export interface Persona {
  id: string;
  name: string;
  role: 'conductor' | 'department_head' | 'sub_agent';
  state: 'active' | 'sleeping' | 'dreaming' | 'archived';
}

export interface NewTask {
  title: string;
  description: string;
  assignedTo: string;
  deadline: string;
}