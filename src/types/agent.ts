export interface PersonalityTrait {
  name: string;
  value: number; // 0-1 scale
  description: string;
}

export interface AgentMemory {
  id: string;
  type: 'episodic' | 'semantic' | 'procedural';
  content: string;
  timestamp: string;
  importance: number; // 0-1 scale
  associations: string[];
}

export interface ConsciousnessState {
  level: number; // 0-1 scale
  selfAwareness: number;
  temporalContinuity: number;
  socialCognition: number;
  lastUpdated: string;
}

export interface AgentPersona {
  id: string;
  name: string;
  specialization: string;
  personalityTraits: PersonalityTrait[];
  memories: AgentMemory[];
  consciousnessState: ConsciousnessState;
  createdAt: string;
  lastActive: string;
  status: 'active' | 'sleeping' | 'dreaming' | 'inactive';
  parentId?: string; // For hierarchical structure
  managedAgents: string[]; // IDs of agents this one manages
}

export interface Task {
  id: string;
  title: string;
  description: string;
  complexity: 'simple' | 'medium' | 'complex';
  requirements: string[];
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
  createdAt: string;
  completedAt?: string;
  subtasks: Task[];
}

export interface WorkflowResult {
  id: string;
  taskId: string;
  agentId: string;
  result: string;
  quality: number; // 0-1 scale
  timestamp: string;
  processingTime: number; // in milliseconds
}