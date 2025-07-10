import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Settings, Check, Loader2 } from 'lucide-react';
import { OpenRouterConfig, OpenRouterClient, OpenRouterModel, POPULAR_MODELS } from '@/lib/openrouter';
import { useToast } from '@/hooks/use-toast';

interface OpenRouterConfigProps {
  onConfigChange?: () => void;
}

export function OpenRouterConfigDialog({ onConfigChange }: OpenRouterConfigProps) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [availableModels, setAvailableModels] = useState<OpenRouterModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const currentApiKey = OpenRouterConfig.getApiKey() || '';
    const currentModel = OpenRouterConfig.getSelectedModel();
    
    setApiKey(currentApiKey);
    setSelectedModel(currentModel);
  }, [open]);

  const fetchModels = async (testApiKey: string) => {
    if (!testApiKey.trim()) return;

    setIsLoading(true);
    try {
      const client = new OpenRouterClient(testApiKey);
      const models = await client.getModels();
      
      // Filter for chat completion models (exclude only embedding models)
      const chatModels = models.filter(model => 
        !model.id.includes('embed') &&
        !model.id.includes('embedding') &&
        model.id.includes('/') // Valid model format
      );

      // Sort with popular models first
      const sortedModels = chatModels.sort((a, b) => {
        const aIndex = POPULAR_MODELS.indexOf(a.id);
        const bIndex = POPULAR_MODELS.indexOf(b.id);
        
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.name.localeCompare(b.name);
      });

      setAvailableModels(sortedModels);
      
      toast({
        title: "Models loaded successfully",
        description: `Found ${sortedModels.length} available models`,
      });
    } catch (error) {
      toast({
        title: "Failed to load models",
        description: error instanceof Error ? error.message : "Please check your API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenRouter API key",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    try {
      const client = new OpenRouterClient(apiKey);
      await client.getModels();
      
      toast({
        title: "Connection successful!",
        description: "Your API key is valid and working",
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Please check your API key",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenRouter API key",
        variant: "destructive",
      });
      return;
    }

    if (!selectedModel) {
      toast({
        title: "Model Required",
        description: "Please select a model",
        variant: "destructive",
      });
      return;
    }

    OpenRouterConfig.setApiKey(apiKey);
    OpenRouterConfig.setSelectedModel(selectedModel);
    
    toast({
      title: "Configuration saved",
      description: "OpenRouter settings have been updated",
    });

    setOpen(false);
    onConfigChange?.();
  };

  const isConfigured = OpenRouterConfig.isConfigured();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          OpenRouter Config
          {isConfigured && <Check className="h-4 w-4 text-primary" />}
          {!isConfigured && <AlertCircle className="h-4 w-4 text-destructive" />}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>OpenRouter Configuration</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* API Key Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">API Key</CardTitle>
              <CardDescription>
                Enter your OpenRouter API key. Get one at{' '}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  openrouter.ai/keys
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-or-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={testConnection}
                  disabled={!apiKey.trim() || isTestingConnection}
                  variant="outline"
                  className="gap-2"
                >
                  {isTestingConnection && <Loader2 className="h-4 w-4 animate-spin" />}
                  Test Connection
                </Button>
                
                <Button 
                  onClick={() => fetchModels(apiKey)}
                  disabled={!apiKey.trim() || isLoading}
                  variant="outline"
                  className="gap-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Load Models
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Model Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Model Selection</CardTitle>
              <CardDescription>
                Choose the AI model for agent responses. Claude Sonnet 4 is recommended for best results.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="model-select">Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.length > 0 ? (
                      availableModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            <span>{model.name}</span>
                            {POPULAR_MODELS.includes(model.id) && (
                              <Badge variant="secondary" className="text-xs">Popular</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      POPULAR_MODELS.map((modelId) => (
                        <SelectItem key={modelId} value={modelId}>
                          {modelId.replace('/', ' / ')}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedModel && availableModels.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  {(() => {
                    const model = availableModels.find(m => m.id === selectedModel);
                    if (!model) return null;
                    
                    return (
                      <div className="space-y-2 text-sm">
                        <div><strong>Context Length:</strong> {model.context_length?.toLocaleString() || 'Unknown'}</div>
                        <div><strong>Description:</strong> {model.description || 'No description available'}</div>
                        {model.pricing && (
                          <div>
                            <strong>Pricing:</strong> ${model.pricing.prompt}/1K prompt tokens, ${model.pricing.completion}/1K completion tokens
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} className="gap-2">
              <Check className="h-4 w-4" />
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}