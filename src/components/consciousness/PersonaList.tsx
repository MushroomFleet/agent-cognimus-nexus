import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Users, User, Clock, Zap, Pause, Settings, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PersonaCreator } from './PersonaCreator';

interface Persona {
  id: string;
  name: string;
  role: 'conductor' | 'department_head' | 'sub_agent';
  state: 'active' | 'sleeping' | 'dreaming' | 'archived';
  consciousness_level: number;
  experience_count: number;
  department?: string;
  specialization?: string;
  created_at: string;
  last_active_at: string;
}

interface PersonaListProps {
  personas: Persona[];
  onUpdate: () => void;
}

const ROLE_ICONS = {
  conductor: Brain,
  department_head: Users,
  sub_agent: User
};

const STATE_COLORS = {
  active: 'bg-green-500',
  sleeping: 'bg-blue-500',
  dreaming: 'bg-purple-500',
  archived: 'bg-gray-500'
};

export function PersonaList({ personas, onUpdate }: PersonaListProps) {
  const { toast } = useToast();
  const [showSubAgentCreator, setShowSubAgentCreator] = useState<string | null>(null);

  const updatePersonaState = async (personaId: string, newState: Persona['state']) => {
    try {
      const { error } = await supabase
        .from('personas')
        .update({ 
          state: newState,
          last_active_at: new Date().toISOString()
        })
        .eq('id', personaId);

      if (error) throw error;

      toast({
        title: "State Updated",
        description: `Persona ${newState === 'sleeping' ? 'entered dream state' : 'awakened'}`,
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deletePersona = async (personaId: string, name: string) => {
    try {
      const { error } = await supabase
        .from('personas')
        .delete()
        .eq('id', personaId);

      if (error) throw error;

      toast({
        title: "Persona Archived",
        description: `${name} has been removed from the consciousness network`,
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Archive Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const groupedPersonas = {
    conductor: personas.filter(p => p.role === 'conductor'),
    department_head: personas.filter(p => p.role === 'department_head'),
    sub_agent: personas.filter(p => p.role === 'sub_agent')
  };

  const renderPersonaCard = (persona: Persona) => {
    const RoleIcon = ROLE_ICONS[persona.role];
    
    return (
      <Card key={persona.id} className="relative">
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${STATE_COLORS[persona.state]}`} />
        
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <RoleIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{persona.name}</CardTitle>
          </div>
          <CardDescription>
            {persona.department && (
              <Badge variant="secondary" className="mr-2">{persona.department}</Badge>
            )}
            {persona.specialization && (
              <Badge variant="outline">{persona.specialization}</Badge>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Consciousness Level</span>
            <Badge variant="secondary">{persona.consciousness_level}</Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Experiences</span>
            <span className="font-medium">{persona.experience_count}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">State</span>
            <Badge 
              variant={persona.state === 'active' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {persona.state}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            {persona.state === 'active' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updatePersonaState(persona.id, 'sleeping')}
                className="gap-1"
              >
                <Pause className="h-3 w-3" />
                Sleep
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updatePersonaState(persona.id, 'active')}
                className="gap-1"
              >
                <Zap className="h-3 w-3" />
                Wake
              </Button>
            )}
            
            {(persona.role === 'conductor' || persona.role === 'department_head') && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSubAgentCreator(persona.id)}
                className="gap-1"
              >
                <Users className="h-3 w-3" />
                Recruit
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => deletePersona(persona.id, persona.name)}
              className="gap-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Conductors */}
      {groupedPersonas.conductor.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Conductor Network</h3>
            <Badge variant="secondary">{groupedPersonas.conductor.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedPersonas.conductor.map(renderPersonaCard)}
          </div>
        </div>
      )}

      {/* Department Heads */}
      {groupedPersonas.department_head.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Department Heads</h3>
            <Badge variant="secondary">{groupedPersonas.department_head.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedPersonas.department_head.map(renderPersonaCard)}
          </div>
        </div>
      )}

      {/* Sub-Agents */}
      {groupedPersonas.sub_agent.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Sub-Agents</h3>
            <Badge variant="secondary">{groupedPersonas.sub_agent.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedPersonas.sub_agent.map(renderPersonaCard)}
          </div>
        </div>
      )}

      {personas.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Personas Created</h3>
            <p className="text-muted-foreground mb-6">
              Create your first consciousness to begin building the agent network
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sub-agent creator for recruitment */}
      {showSubAgentCreator && (
        <PersonaCreator
          open={!!showSubAgentCreator}
          onClose={() => setShowSubAgentCreator(null)}
          onSuccess={() => {
            setShowSubAgentCreator(null);
            onUpdate();
          }}
          parentPersona={showSubAgentCreator}
        />
      )}
    </div>
  );
}