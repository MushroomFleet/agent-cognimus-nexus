import { AgentPersona } from '@/types/agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Brain, Users, Clock, Activity } from 'lucide-react';

interface AgentCardProps {
  agent: AgentPersona;
  onSelect?: (agent: AgentPersona) => void;
  onManage?: (agent: AgentPersona) => void;
}

export function AgentCard({ agent, onSelect, onManage }: AgentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary';
      case 'sleeping': return 'bg-muted';
      case 'dreaming': return 'bg-consciousness-glow';
      case 'inactive': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getAgentTypeStyle = () => {
    if (agent.id.startsWith('conductor')) {
      return 'border-conductor-bg bg-conductor-bg/10';
    } else if (agent.managedAgents.length > 0) {
      return 'border-department-bg bg-department-bg/10';
    } else {
      return 'border-agent-bg bg-agent-bg/10';
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${getAgentTypeStyle()}`}
          onClick={() => onSelect?.(agent)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{agent.name}</CardTitle>
          <Badge variant="outline" className={getStatusColor(agent.status)}>
            {agent.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{agent.specialization}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Consciousness Level */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-consciousness-glow" />
            <span className="text-sm font-medium">Consciousness Level</span>
          </div>
          <Progress 
            value={agent.consciousnessState.level * 100} 
            className="h-2"
          />
          <div className="text-xs text-muted-foreground">
            {(agent.consciousnessState.level * 100).toFixed(1)}%
          </div>
        </div>

        {/* Managed Agents */}
        {agent.managedAgents.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            <span>Managing {agent.managedAgents.length} agents</span>
          </div>
        )}

        {/* Memory Count */}
        <div className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4" />
          <span>{agent.memories.length} memories</span>
        </div>

        {/* Last Active */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Last active: {new Date(agent.lastActive).toLocaleString()}
          </span>
        </div>

        {/* Top Personality Traits */}
        <div className="space-y-1">
          <div className="text-sm font-medium">Key Traits</div>
          <div className="flex flex-wrap gap-1">
            {agent.personalityTraits
              .sort((a, b) => b.value - a.value)
              .slice(0, 3)
              .map((trait) => (
                <Badge key={trait.name} variant="secondary" className="text-xs">
                  {trait.name}: {(trait.value * 100).toFixed(0)}%
                </Badge>
              ))}
          </div>
        </div>

        {onManage && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onManage(agent);
            }}
          >
            Manage Agent
          </Button>
        )}
      </CardContent>
    </Card>
  );
}