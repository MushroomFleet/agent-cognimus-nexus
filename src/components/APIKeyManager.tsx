import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Key, Check, AlertCircle, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { APIKeyManager, API_PROVIDERS, APIKeyConfig } from '@/lib/api-keys';
import { useToast } from '@/hooks/use-toast';

interface APIKeyManagerProps {
  onConfigChange?: () => void;
}

export function APIKeyManagerDialog({ onConfigChange }: APIKeyManagerProps) {
  const [open, setOpen] = useState(false);
  const [keys, setKeys] = useState<APIKeyConfig[]>([]);
  const [testingStates, setTestingStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadKeys();
    }
  }, [open]);

  const loadKeys = () => {
    const storedKeys = APIKeyManager.getAllKeys();
    setKeys(storedKeys);
  };

  const handleKeyChange = (provider: string, value: string) => {
    setKeys(prev => {
      const updated = [...prev];
      const existingIndex = updated.findIndex(k => k.provider === provider);
      
      if (existingIndex >= 0) {
        updated[existingIndex] = { ...updated[existingIndex], key: value, isValid: undefined };
      } else {
        const providerInfo = API_PROVIDERS.find(p => p.id === provider);
        updated.push({
          name: providerInfo?.name || provider,
          provider,
          key: value,
          isValid: undefined
        });
      }
      
      return updated;
    });
  };

  const testKey = async (provider: string) => {
    const keyConfig = keys.find(k => k.provider === provider);
    if (!keyConfig?.key) return;

    setTestingStates(prev => ({ ...prev, [provider]: true }));

    try {
      const isValid = await APIKeyManager.testKey(provider, keyConfig.key);
      
      const updatedConfig = {
        ...keyConfig,
        isValid,
        lastTested: new Date()
      };

      APIKeyManager.setKey(updatedConfig);
      
      setKeys(prev => prev.map(k => 
        k.provider === provider ? updatedConfig : k
      ));

      toast({
        title: isValid ? "API Key Valid" : "API Key Invalid",
        description: isValid ? "Connection successful!" : "Please check your API key",
        variant: isValid ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Unable to test API key",
        variant: "destructive",
      });
    } finally {
      setTestingStates(prev => ({ ...prev, [provider]: false }));
    }
  };

  const saveKey = (provider: string) => {
    const keyConfig = keys.find(k => k.provider === provider);
    if (!keyConfig?.key) return;

    if (!APIKeyManager.validateKeyFormat(provider, keyConfig.key)) {
      toast({
        title: "Invalid Key Format",
        description: `Please check the format of your ${keyConfig.name} API key`,
        variant: "destructive",
      });
      return;
    }

    APIKeyManager.setKey(keyConfig);
    
    toast({
      title: "API Key Saved",
      description: `${keyConfig.name} configuration updated`,
    });

    onConfigChange?.();
  };

  const removeKey = (provider: string) => {
    APIKeyManager.removeKey(provider);
    setKeys(prev => prev.filter(k => k.provider !== provider));
    
    toast({
      title: "API Key Removed",
      description: "Configuration has been updated",
    });

    onConfigChange?.();
  };

  const getConfiguredCount = () => {
    return APIKeyManager.getConfiguredProviders().length;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Key className="h-4 w-4" />
          API Keys
          <Badge variant={getConfiguredCount() > 0 ? "default" : "secondary"}>
            {getConfiguredCount()}
          </Badge>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Management
          </DialogTitle>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            API keys are stored locally in your browser and never sent to our servers. 
            For security, we recommend using API keys with appropriate rate limits and monitoring.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="configure" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="configure">Configure Keys</TabsTrigger>
            <TabsTrigger value="manage">Manage & Test</TabsTrigger>
          </TabsList>

          <TabsContent value="configure" className="space-y-4">
            <div className="grid gap-4">
              {API_PROVIDERS.map((provider) => {
                const keyConfig = keys.find(k => k.provider === provider.id);
                const isConfigured = APIKeyManager.isConfigured(provider.id);
                
                return (
                  <Card key={provider.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {provider.name}
                            {isConfigured && <Check className="h-4 w-4 text-primary" />}
                          </CardTitle>
                          <CardDescription>{provider.description}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(provider.docsUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${provider.id}-key`}>API Key</Label>
                        <Input
                          id={`${provider.id}-key`}
                          type="password"
                          placeholder={`Enter your ${provider.name} API key...`}
                          value={keyConfig?.key || ''}
                          onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => saveKey(provider.id)}
                          disabled={!keyConfig?.key}
                          size="sm"
                        >
                          Save Key
                        </Button>
                        
                        {provider.testEndpoint && (
                          <Button 
                            onClick={() => testKey(provider.id)}
                            disabled={!keyConfig?.key || testingStates[provider.id]}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            {testingStates[provider.id] && <Loader2 className="h-3 w-3 animate-spin" />}
                            Test
                          </Button>
                        )}
                        
                        {isConfigured && (
                          <Button 
                            onClick={() => removeKey(provider.id)}
                            variant="outline"
                            size="sm"
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </Button>
                        )}
                      </div>
                      
                      {keyConfig?.isValid !== undefined && (
                        <Alert variant={keyConfig.isValid ? "default" : "destructive"}>
                          <AlertDescription>
                            {keyConfig.isValid ? "✓ API key is valid and working" : "✗ API key validation failed"}
                            {keyConfig.lastTested && (
                              <span className="text-xs block mt-1">
                                Last tested: {keyConfig.lastTested.toLocaleString()}
                              </span>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configured API Keys</CardTitle>
                <CardDescription>
                  Manage your stored API keys and test connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getConfiguredCount() === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No API keys configured yet. Switch to the "Configure Keys" tab to add your first API key.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {APIKeyManager.getConfiguredProviders().map((providerId) => {
                      const provider = API_PROVIDERS.find(p => p.id === providerId);
                      const keyConfig = APIKeyManager.getKey(providerId);
                      
                      if (!provider || !keyConfig) return null;
                      
                      return (
                        <div key={providerId} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">{provider.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Key: {keyConfig.key.substring(0, 8)}...
                              {keyConfig.isValid !== undefined && (
                                <Badge variant={keyConfig.isValid ? "default" : "destructive"} className="ml-2">
                                  {keyConfig.isValid ? "Valid" : "Invalid"}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {provider.testEndpoint && (
                              <Button 
                                onClick={() => testKey(providerId)}
                                disabled={testingStates[providerId]}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                              >
                                {testingStates[providerId] && <Loader2 className="h-3 w-3 animate-spin" />}
                                Test
                              </Button>
                            )}
                            
                            <Button 
                              onClick={() => removeKey(providerId)}
                              variant="outline"
                              size="sm"
                              className="gap-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}