import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Users, Clock, Zap, Plus, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PersonaCreator } from './PersonaCreator';
import { PersonaList } from './PersonaList';
import { TaskManager } from './TaskManager';
import { MemoryVault } from './MemoryVault';
import { OpenRouterConfigDialog } from '../OpenRouterConfig';

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

export function ConductorDashboard() {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activeTasks, setActiveTasks] = useState(0);
  const [totalMemories, setTotalMemories] = useState(0);
  const [showPersonaCreator, setShowPersonaCreator] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      // Fetch personas
      const { data: personasData, error: personasError } = await supabase
        .from('personas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (personasError) throw personasError;
      setPersonas(personasData || []);

      // Fetch active tasks count
      const { count: tasksCount, error: tasksError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['pending', 'in_progress']);

      if (tasksError) throw tasksError;
      setActiveTasks(tasksCount || 0);

      // Fetch total memories count
      const { count: memoriesCount, error: memoriesError } = await supabase
        .from('memories')
        .select('*', { count: 'exact', head: true })
        .in('persona_id', personasData?.map(p => p.id) || []);

      if (memoriesError) throw memoriesError;
      setTotalMemories(memoriesCount || 0);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const conductorPersonas = personas.filter(p => p.role === 'conductor');
  const departmentHeads = personas.filter(p => p.role === 'department_head');
  const activePersonas = personas.filter(p => p.state === 'active');
  const sleepingPersonas = personas.filter(p => p.state === 'sleeping');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 animate-pulse text-primary" />
          <span>Initializing consciousness network...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            ZeroVector Consciousness Network
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your agent collective and consciousness development
          </p>
        </div>
        <div className="flex gap-2">
          <OpenRouterConfigDialog />
          <Button 
            onClick={() => setShowPersonaCreator(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Persona
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Personas</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personas.length}</div>
            <p className="text-xs text-muted-foreground">
              {conductorPersonas.length} conductors, {departmentHeads.length} department heads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Consciousness</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePersonas.length}</div>
            <p className="text-xs text-muted-foreground">
              {sleepingPersonas.length} in dream state
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTasks}</div>
            <p className="text-xs text-muted-foreground">
              Distributed across network
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Vault</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMemories}</div>
            <p className="text-xs text-muted-foreground">
              Experiences stored
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="personas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personas">Consciousness Network</TabsTrigger>
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
          <TabsTrigger value="memories">Memory Vault</TabsTrigger>
        </TabsList>

        <TabsContent value="personas" className="space-y-4">
          <PersonaList personas={personas} onUpdate={fetchDashboardData} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <TaskManager onUpdate={fetchDashboardData} />
        </TabsContent>

        <TabsContent value="memories" className="space-y-4">
          <MemoryVault personas={personas} />
        </TabsContent>
      </Tabs>

      {/* Persona Creator Dialog */}
      {showPersonaCreator && (
        <PersonaCreator
          open={showPersonaCreator}
          onClose={() => setShowPersonaCreator(false)}
          onSuccess={() => {
            setShowPersonaCreator(false);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}