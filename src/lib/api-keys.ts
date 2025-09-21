// Enhanced API Key Management System for OrangeAI
// Supports multiple AI service providers with local storage

export interface APIKeyConfig {
  name: string;
  key: string;
  provider: string;
  isValid?: boolean;
  lastTested?: Date;
}

export interface APIProvider {
  id: string;
  name: string;
  description: string;
  keyPattern: RegExp;
  testEndpoint?: string;
  docsUrl: string;
}

// Supported API providers
export const API_PROVIDERS: APIProvider[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access to multiple AI models through a single API',
    keyPattern: /^sk-or-[a-zA-Z0-9-_]{20,}$/,
    testEndpoint: 'https://openrouter.ai/api/v1/models',
    docsUrl: 'https://openrouter.ai/keys'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT models and other OpenAI services',
    keyPattern: /^sk-[a-zA-Z0-9]{48,}$/,
    testEndpoint: 'https://api.openai.com/v1/models',
    docsUrl: 'https://platform.openai.com/api-keys'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude models',
    keyPattern: /^sk-ant-[a-zA-Z0-9-_]{95,}$/,
    testEndpoint: 'https://api.anthropic.com/v1/messages',
    docsUrl: 'https://console.anthropic.com/account/keys'
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Gemini models',
    keyPattern: /^[a-zA-Z0-9-_]{39}$/,
    testEndpoint: 'https://generativelanguage.googleapis.com/v1/models',
    docsUrl: 'https://makersuite.google.com/app/apikey'
  }
];

export class APIKeyManager {
  private static readonly STORAGE_KEY = 'orange_ai_api_keys';

  static getAllKeys(): APIKeyConfig[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load API keys:', error);
      return [];
    }
  }

  static getKey(provider: string): APIKeyConfig | null {
    const keys = this.getAllKeys();
    return keys.find(key => key.provider === provider) || null;
  }

  static setKey(config: APIKeyConfig): void {
    const keys = this.getAllKeys();
    const existingIndex = keys.findIndex(key => key.provider === config.provider);
    
    if (existingIndex >= 0) {
      keys[existingIndex] = config;
    } else {
      keys.push(config);
    }
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keys));
    } catch (error) {
      console.error('Failed to save API key:', error);
      throw new Error('Failed to save API key to local storage');
    }
  }

  static removeKey(provider: string): void {
    const keys = this.getAllKeys();
    const filtered = keys.filter(key => key.provider !== provider);
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove API key:', error);
    }
  }

  static validateKeyFormat(provider: string, key: string): boolean {
    const providerConfig = API_PROVIDERS.find(p => p.id === provider);
    if (!providerConfig) return false;
    return providerConfig.keyPattern.test(key);
  }

  static async testKey(provider: string, key: string): Promise<boolean> {
    const providerConfig = API_PROVIDERS.find(p => p.id === provider);
    if (!providerConfig?.testEndpoint) return true; // Skip test if no endpoint

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add appropriate auth header based on provider
      switch (provider) {
        case 'openrouter':
        case 'openai':
          headers['Authorization'] = `Bearer ${key}`;
          break;
        case 'anthropic':
          headers['x-api-key'] = key;
          headers['anthropic-version'] = '2023-06-01';
          break;
        case 'google':
          // Google uses query param for API key
          break;
      }

      const url = provider === 'google' 
        ? `${providerConfig.testEndpoint}?key=${key}`
        : providerConfig.testEndpoint;

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      return response.ok;
    } catch (error) {
      console.error(`Failed to test ${provider} API key:`, error);
      return false;
    }
  }

  static isConfigured(provider: string): boolean {
    const key = this.getKey(provider);
    return key !== null && key.key.length > 0;
  }

  static getConfiguredProviders(): string[] {
    return this.getAllKeys()
      .filter(key => key.key.length > 0)
      .map(key => key.provider);
  }

  // Migration from old OpenRouter storage
  static migrateFromLegacyStorage(): void {
    const legacyApiKey = localStorage.getItem('openrouter_api_key');
    const legacyModel = localStorage.getItem('openrouter_model');
    
    if (legacyApiKey && !this.isConfigured('openrouter')) {
      this.setKey({
        name: 'OpenRouter',
        key: legacyApiKey,
        provider: 'openrouter',
        isValid: true
      });
      
      // Keep the model selection in new format
      if (legacyModel) {
        localStorage.setItem('orange_ai_selected_model', legacyModel);
      }
    }
  }

  // Export/Import functionality for easy setup
  static exportConfig(): string {
    const keys = this.getAllKeys();
    const exportData = {
      version: '1.0',
      keys: keys.map(key => ({
        name: key.name,
        provider: key.provider,
        // Don't export actual keys for security
        hasKey: key.key.length > 0,
        isValid: key.isValid,
        lastTested: key.lastTested
      }))
    };
    return JSON.stringify(exportData, null, 2);
  }

  static importConfig(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);
      if (!data.version || !data.keys) {
        return { success: false, message: 'Invalid configuration format' };
      }
      
      // This would be used to validate structure
      // Actual keys would need to be entered manually for security
      return { success: true, message: 'Configuration structure validated. Please enter your API keys manually.' };
    } catch (error) {
      return { success: false, message: 'Invalid JSON format' };
    }
  }
}

// Initialize and migrate on load
APIKeyManager.migrateFromLegacyStorage();
