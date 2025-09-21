import { AgentPersona, Task } from '@/types/agent';

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  top_provider: {
    max_completion_tokens?: number;
  };
}

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getModels(): Promise<OpenRouterModel[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  async generateCompletion(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'OrangeAI Agent System',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  }

  async generateAgentResponse(
    agent: AgentPersona,
    task: Task,
    systemContext?: string
  ): Promise<string> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(agent, systemContext),
      },
      {
        role: 'user',
        content: this.buildTaskPrompt(task),
      }
    ];

    const request: OpenRouterRequest = {
      model: this.getSelectedModel(),
      messages,
      temperature: this.calculateTemperatureFromPersonality(agent),
      max_tokens: 500,
      top_p: 0.9,
    };

    const response = await this.generateCompletion(request);
    return response.choices[0]?.message?.content || 'Unable to generate response.';
  }

  private buildSystemPrompt(agent: AgentPersona, context?: string): string {
    const topTraits = agent.personalityTraits
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map(trait => `${trait.name} (${(trait.value * 100).toFixed(0)}%)`)
      .join(', ');

    const recentMemories = agent.memories
      .slice(-3)
      .map(memory => memory.content)
      .join('\n');

    return `You are ${agent.name}, an AI agent specialized in ${agent.specialization}.

Your key personality traits: ${topTraits}

Your consciousness level: ${(agent.consciousnessState.level * 100).toFixed(1)}%
Self-awareness: ${(agent.consciousnessState.selfAwareness * 100).toFixed(1)}%

Recent memories:
${recentMemories}

${context || ''}

Respond as this agent would, reflecting their specialization and personality traits. Be professional yet personable, showing expertise in your domain while maintaining the personality characteristics defined above.`;
  }

  private buildTaskPrompt(task: Task): string {
    return `Task: ${task.title}

Description: ${task.description}

Complexity: ${task.complexity}

Requirements: ${task.requirements.join(', ')}

Please provide a detailed response addressing this task based on your expertise and specialization.`;
  }

  private calculateTemperatureFromPersonality(agent: AgentPersona): number {
    // Find creativity-related traits and adjust temperature
    const creativityTraits = agent.personalityTraits.filter(trait =>
      trait.name.toLowerCase().includes('creative') ||
      trait.name.toLowerCase().includes('innovative') ||
      trait.name.toLowerCase().includes('analytical')
    );

    if (creativityTraits.length === 0) {
      return 0.7; // Default temperature
    }

    const avgCreativity = creativityTraits.reduce((sum, trait) => {
      // Analytical traits should lower temperature, creative traits increase it
      const factor = trait.name.toLowerCase().includes('analytical') ? -trait.value : trait.value;
      return sum + factor;
    }, 0) / creativityTraits.length;

    // Map creativity (-1 to 1) to temperature (0.3 to 1.2)
    return Math.max(0.3, Math.min(1.2, 0.7 + avgCreativity * 0.5));
  }

  private getSelectedModel(): string {
    return localStorage.getItem('orange_ai_selected_model') || localStorage.getItem('openrouter_model') || 'anthropic/claude-3-5-sonnet-20241022';
  }
}

// Configuration management
export class OpenRouterConfig {
  static getApiKey(): string | null {
    return localStorage.getItem('openrouter_api_key');
  }

  static setApiKey(apiKey: string): void {
    localStorage.setItem('openrouter_api_key', apiKey);
  }

  static getSelectedModel(): string {
    return localStorage.getItem('orange_ai_selected_model') || localStorage.getItem('openrouter_model') || 'anthropic/claude-3-5-sonnet-20241022';
  }

  static setSelectedModel(model: string): void {
    localStorage.setItem('orange_ai_selected_model', model);
    // Also keep legacy for compatibility
    localStorage.setItem('openrouter_model', model);
  }

  static isConfigured(): boolean {
    return !!this.getApiKey();
  }

  static createClient(): OpenRouterClient | null {
    const apiKey = this.getApiKey();
    return apiKey ? new OpenRouterClient(apiKey) : null;
  }
}

// Default models with Claude Sonnet 4 preference
export const POPULAR_MODELS = [
  'anthropic/claude-3-5-sonnet-20241022',
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'anthropic/claude-3-opus',
  'anthropic/claude-3-haiku',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mixtral-8x7b-instruct',
  'google/gemini-pro-1.5',
];