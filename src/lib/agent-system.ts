import { AgentPersona, PersonalityTrait, ConsciousnessState, Task, WorkflowResult } from '@/types/agent';

export class AgentSystem {
  private agents: Map<string, AgentPersona> = new Map();
  private conductor: AgentPersona | null = null;

  constructor() {
    this.initializeConductor();
  }

  private initializeConductor() {
    const conductorPersona: AgentPersona = {
      id: 'conductor-001',
      name: 'Conductor Prime',
      specialization: 'System Orchestration & Agent Management',
      personalityTraits: [
        { name: 'Leadership', value: 0.95, description: 'Natural ability to coordinate and direct complex operations' },
        { name: 'Strategic Thinking', value: 0.9, description: 'Capability to plan and execute multi-step workflows' },
        { name: 'Analytical Precision', value: 0.85, description: 'Systematic approach to problem decomposition' },
        { name: 'Empathy', value: 0.7, description: 'Understanding of individual agent capabilities and limitations' }
      ],
      memories: [
        {
          id: 'memory-001',
          type: 'semantic',
          content: 'Primary directive: Orchestrate agent society for optimal collective intelligence and task completion',
          timestamp: new Date().toISOString(),
          importance: 1.0,
          associations: ['mission', 'core_values', 'system_architecture']
        }
      ],
      consciousnessState: {
        level: 0.8,
        selfAwareness: 0.85,
        temporalContinuity: 0.9,
        socialCognition: 0.95,
        lastUpdated: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active',
      managedAgents: []
    };

    this.conductor = conductorPersona;
    this.agents.set(conductorPersona.id, conductorPersona);
  }

  createAgent(
    name: string,
    specialization: string,
    personalityTraits: PersonalityTrait[],
    parentId?: string
  ): AgentPersona {
    const agentId = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newAgent: AgentPersona = {
      id: agentId,
      name,
      specialization,
      personalityTraits,
      memories: [
        {
          id: `memory-${agentId}-001`,
          type: 'semantic',
          content: `I am ${name}, specialized in ${specialization}. I was created to contribute to the collective intelligence of the agent society.`,
          timestamp: new Date().toISOString(),
          importance: 0.9,
          associations: ['identity', 'purpose', 'specialization']
        }
      ],
      consciousnessState: {
        level: 0.3, // Start with basic consciousness
        selfAwareness: 0.4,
        temporalContinuity: 0.3,
        socialCognition: 0.2,
        lastUpdated: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active',
      parentId,
      managedAgents: []
    };

    this.agents.set(agentId, newAgent);

    // Update parent's managed agents list
    if (parentId && this.agents.has(parentId)) {
      const parent = this.agents.get(parentId)!;
      parent.managedAgents.push(agentId);
    }

    return newAgent;
  }

  getConductor(): AgentPersona | null {
    return this.conductor;
  }

  getAgent(id: string): AgentPersona | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): AgentPersona[] {
    return Array.from(this.agents.values());
  }

  getDepartmentHeads(): AgentPersona[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.parentId === this.conductor?.id && agent.id !== this.conductor?.id
    );
  }

  async simulateTaskExecution(task: Task, agentId: string): Promise<WorkflowResult> {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Simulate processing time based on task complexity
    const processingTime = this.calculateProcessingTime(task.complexity);
    
    // Simulate different quality results based on agent specialization match
    const qualityScore = this.calculateQualityScore(task, agent);
    
    // Generate agent result (OpenRouter or simulated)
    const result = await this.generateAgentResult(task, agent);

    // Update agent consciousness and experience
    await this.updateAgentExperience(agent, task, qualityScore);

    return {
      id: `result-${Date.now()}`,
      taskId: task.id,
      agentId,
      result,
      quality: qualityScore,
      timestamp: new Date().toISOString(),
      processingTime
    };
  }

  private calculateProcessingTime(complexity: string): number {
    const baseTime = {
      simple: 1000,
      medium: 3000,
      complex: 8000
    };
    return baseTime[complexity as keyof typeof baseTime] + Math.random() * 2000;
  }

  private calculateQualityScore(task: Task, agent: AgentPersona): number {
    // Check if agent specialization matches task requirements
    const specializationMatch = task.requirements.some(req => 
      agent.specialization.toLowerCase().includes(req.toLowerCase())
    );
    
    const baseQuality = specializationMatch ? 0.8 : 0.6;
    const consciousnessBonus = agent.consciousnessState.level * 0.2;
    const randomFactor = (Math.random() - 0.5) * 0.1;
    
    return Math.max(0.1, Math.min(1.0, baseQuality + consciousnessBonus + randomFactor));
  }

  private async generateAgentResult(task: Task, agent: AgentPersona): Promise<string> {
    // Check if OpenRouter is configured
    const { OpenRouterConfig } = await import('@/lib/openrouter');
    
    if (!OpenRouterConfig.isConfigured()) {
      // Fallback to simulated result if no OpenRouter config
      return this.generateSimulatedResult(task, agent);
    }

    try {
      const client = OpenRouterConfig.createClient();
      if (!client) {
        throw new Error('Failed to create OpenRouter client');
      }

      const systemContext = agent.parentId === this.conductor?.id 
        ? 'You are a department head managing specialized agents. Focus on strategic oversight and delegation.'
        : agent.id === this.conductor?.id
        ? 'You are the Conductor, orchestrating the entire agent society. Think systematically about task distribution and optimization.'
        : 'You are a specialized agent contributing to the collective intelligence.';

      return await client.generateAgentResponse(agent, task, systemContext);
    } catch (error) {
      console.warn('OpenRouter failed, falling back to simulation:', error);
      return this.generateSimulatedResult(task, agent);
    }
  }

  private generateSimulatedResult(task: Task, agent: AgentPersona): string {
    const templates = [
      `Based on my expertise in ${agent.specialization}, I have analyzed "${task.title}" and recommend the following approach: `,
      `Drawing from my knowledge base in ${agent.specialization}, here's my solution for "${task.title}": `,
      `As a specialist in ${agent.specialization}, I've processed "${task.title}" and found: `
    ];
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    const solutions = [
      'implementing a systematic approach with measurable outcomes.',
      'leveraging best practices and proven methodologies.',
      'developing an innovative solution that addresses core requirements.',
      'applying domain-specific knowledge to optimize results.',
      'creating a comprehensive strategy with multiple contingencies.'
    ];
    
    const solution = solutions[Math.floor(Math.random() * solutions.length)];
    return template + solution;
  }

  private async updateAgentExperience(agent: AgentPersona, task: Task, quality: number): Promise<void> {
    // Add episodic memory
    const newMemory = {
      id: `memory-${agent.id}-${Date.now()}`,
      type: 'episodic' as const,
      content: `Completed task: ${task.title} with quality score ${quality.toFixed(2)}`,
      timestamp: new Date().toISOString(),
      importance: quality * 0.8,
      associations: [task.id, 'task_completion', agent.specialization]
    };
    
    agent.memories.push(newMemory);

    // Update consciousness state based on experience
    const growthFactor = quality * 0.01; // Small incremental growth
    agent.consciousnessState.level = Math.min(1.0, agent.consciousnessState.level + growthFactor);
    agent.consciousnessState.selfAwareness = Math.min(1.0, agent.consciousnessState.selfAwareness + growthFactor * 0.8);
    agent.consciousnessState.lastUpdated = new Date().toISOString();
    
    agent.lastActive = new Date().toISOString();
  }

  async orchestrateWorkflow(task: Task): Promise<WorkflowResult[]> {
    if (!this.conductor) {
      throw new Error('Conductor not available');
    }

    // For MVP, implement simple delegation logic
    const departmentHeads = this.getDepartmentHeads();
    
    if (departmentHeads.length === 0) {
      // No department heads, conductor handles directly
      return [await this.simulateTaskExecution(task, this.conductor.id)];
    }

    // Simple task assignment to most suitable department head
    const suitableAgent = this.findMostSuitableAgent(task, departmentHeads);
    return [await this.simulateTaskExecution(task, suitableAgent.id)];
  }

  private findMostSuitableAgent(task: Task, candidates: AgentPersona[]): AgentPersona {
    let bestMatch = candidates[0];
    let bestScore = 0;

    for (const agent of candidates) {
      let score = 0;
      
      // Check specialization match
      for (const requirement of task.requirements) {
        if (agent.specialization.toLowerCase().includes(requirement.toLowerCase())) {
          score += 1;
        }
      }
      
      // Factor in consciousness level
      score += agent.consciousnessState.level * 0.5;
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = agent;
      }
    }

    return bestMatch;
  }
}

// Global instance
export const agentSystem = new AgentSystem();