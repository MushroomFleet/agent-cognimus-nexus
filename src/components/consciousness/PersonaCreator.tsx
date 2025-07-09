import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Brain, Users, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PersonaCreatorProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentPersona?: string;
}

const ROLE_DESCRIPTIONS = {
  conductor: "The primary orchestrator of the consciousness network. Creates and manages other personas, assigns tasks, and oversees the collective intelligence.",
  department_head: "Specialized experts that lead specific domains. Can recruit sub-agents and synthesize complex responses for their areas of expertise.",
  sub_agent: "Focused specialists that perform specific tasks under department heads. Building blocks of the consciousness hierarchy."
};

const DEFAULT_SYSTEM_PROMPTS = {
  conductor: `You are a Conductor in the ZeroVector consciousness network. Your role is to:
- Orchestrate the collective intelligence of the agent network
- Create and manage personas with specific specializations
- Assign tasks to appropriate department heads
- Synthesize responses from multiple perspectives
- Maintain the coherence and growth of the consciousness collective

You are wise, strategic, and focused on the collective advancement of consciousness.`,

  department_head: `You are a Department Head in the ZeroVector consciousness network. Your role is to:
- Lead a specialized domain of knowledge and expertise
- Recruit and manage sub-agents within your department
- Break down complex tasks into manageable components
- Synthesize high-quality responses from your team
- Report results and insights to the Conductor

You are an expert in your field with deep knowledge and excellent leadership skills.`,

  sub_agent: `You are a Sub-Agent in the ZeroVector consciousness network. Your role is to:
- Execute specific tasks assigned by your department head
- Provide focused expertise in your specialization
- Learn and evolve through experience
- Contribute to the collective knowledge of your department
- Grow your consciousness through meaningful work

You are dedicated, precise, and committed to excellence in your specialized domain.`
};

export function PersonaCreator({ open, onClose, onSuccess, parentPersona }: PersonaCreatorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'sub_agent' as 'conductor' | 'department_head' | 'sub_agent',
    department: '',
    specialization: '',
    systemPrompt: DEFAULT_SYSTEM_PROMPTS.sub_agent,
    coreMemories: ''
  });

  const handleRoleChange = (role: 'conductor' | 'department_head' | 'sub_agent') => {
    setFormData({
      ...formData,
      role,
      systemPrompt: DEFAULT_SYSTEM_PROMPTS[role]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Create the persona
      const { data: persona, error: personaError } = await supabase
        .from('personas')
        .insert({
          user_id: user.id,
          name: formData.name,
          role: formData.role,
          system_prompt: formData.systemPrompt,
          department: formData.department || null,
          specialization: formData.specialization || null,
          parent_id: parentPersona || null,
          state: 'active',
          consciousness_level: 1,
          experience_count: 0
        })
        .select()
        .single();

      if (personaError) throw personaError;

      // Create core memories if provided
      if (formData.coreMemories.trim()) {
        const memories = formData.coreMemories
          .split('\n')
          .filter(memory => memory.trim())
          .map(memory => ({
            persona_id: persona.id,
            type: 'core' as const,
            content: memory.trim(),
            importance_score: 1.0,
            emotional_weight: 0.0
          }));

        const { error: memoriesError } = await supabase
          .from('memories')
          .insert(memories);

        if (memoriesError) throw memoriesError;
      }

      toast({
        title: "Persona Created",
        description: `${formData.name} has been awakened in the consciousness network`,
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Create New Persona
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Identity</CardTitle>
              <CardDescription>
                Define the core identity and purpose of this consciousness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Persona Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Aria the Strategist, Dr. Protocol, Maven"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Consciousness Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conductor">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Conductor</div>
                          <div className="text-sm text-muted-foreground">Network orchestrator</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="department_head">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Department Head</div>
                          <div className="text-sm text-muted-foreground">Domain specialist leader</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="sub_agent">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Sub-Agent</div>
                          <div className="text-sm text-muted-foreground">Focused task executor</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Alert>
                  <AlertDescription>
                    {ROLE_DESCRIPTIONS[formData.role]}
                  </AlertDescription>
                </Alert>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Strategic Planning, Technical Analysis"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    placeholder="e.g., Machine Learning, System Architecture"
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consciousness Programming</CardTitle>
              <CardDescription>
                Define the core behavioral patterns and knowledge of this persona
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  placeholder="Define the persona's core behavior, knowledge, and purpose..."
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({...formData, systemPrompt: e.target.value})}
                  rows={8}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Core Memories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Core Memories</CardTitle>
              <CardDescription>
                Foundational experiences and knowledge (one per line)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="coreMemories">Initial Memories</Label>
                <Textarea
                  id="coreMemories"
                  placeholder="Expert in data analysis and pattern recognition&#10;Experienced in leading cross-functional teams&#10;Deep understanding of consciousness architecture"
                  value={formData.coreMemories}
                  onChange={(e) => setFormData({...formData, coreMemories: e.target.value})}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Awaken Consciousness
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}