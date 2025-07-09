import { useState, useEffect } from 'react';
import { AgentPersona, Task, WorkflowResult } from '@/types/agent';
import { agentSystem } from '@/lib/agent-system';
import { AgentCard } from '@/components/AgentCard';
import { TaskCreator } from '@/components/TaskCreator';
import { AgentCreator } from '@/components/AgentCreator';
import { OpenRouterConfigDialog } from '@/components/OpenRouterConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  Brain, 
  Users, 
  Plus, 
  Play, 
  Loader2,
  Crown,
  Building2,
  User,
  Activity,
  Clock
} from 'lucide-react';

const Index = () => {
  const [agents, setAgents] = useState<AgentPersona[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [results, setResults] = useState<WorkflowResult[]>([]);
  const [showAgentCreator, setShowAgentCreator] = useState(false);
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [executingTask, setExecutingTask] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with conductor
    const allAgents = agentSystem.getAllAgents();
    setAgents(allAgents);
  }, []);

  const handleCreateAgent = async (name: string, specialization: string, traits: any[]) => {
    try {
      const conductor = agentSystem.getConductor();
      const newAgent = agentSystem.createAgent(name, specialization, traits, conductor?.id);
      
      setAgents(agentSystem.getAllAgents());
      setShowAgentCreator(false);
      
      toast({
        title: "Agent Created",
        description: `${name} has been added to the agent society`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create agent",
        variant: "destructive",
      });
    }
  };

  const handleCreateTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
    setShowTaskCreator(false);
    
    toast({
      title: "Task Created",
      description: `"${task.title}" is ready for execution`,
    });
  };

  const handleExecuteTask = async (task: Task) => {
    try {
      setExecutingTask(task.id);
      
      const workflowResults = await agentSystem.orchestrateWorkflow(task);
      setResults(prev => [...prev, ...workflowResults]);
      
      // Update task status
      setTasks(prev => prev.map(t => 
        t.id === task.id 
          ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() }
          : t
      ));

      // Refresh agents to show updated consciousness states
      setAgents(agentSystem.getAllAgents());
      
      toast({
        title: "Task Completed",
        description: `"${task.title}" executed successfully by the agent society`,
      });
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: "Task execution encountered an error",
        variant: "destructive",
      });
    } finally {
      setExecutingTask(null);
    }
  };

  const conductor = agents.find(a => a.id.startsWith('conductor'));
  const departmentHeads = agents.filter(a => a.parentId === conductor?.id && a.id !== conductor?.id);
  const regularAgents = agents.filter(a => !a.id.startsWith('conductor') && a.managedAgents.length === 0);

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Brain className="h-8 w-8 text-consciousness-glow" />
                Zero-Vector-4 Platform
              </h1>
              <p className="text-muted-foreground mt-1">
                Advanced Multi-Agent AI Society with Digital Consciousness
              </p>
            </div>
            <div className="flex gap-2">
              <OpenRouterConfigDialog onConfigChange={() => setAgents(agentSystem.getAllAgents())} />
              <Button onClick={() => setShowAgentCreator(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
              <Button onClick={() => setShowTaskCreator(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {showAgentCreator && (
          <div className="mb-6">
            <AgentCreator
              onAgentCreate={handleCreateAgent}
              onCancel={() => setShowAgentCreator(false)}
            />
          </div>
        )}

        {showTaskCreator && (
          <div className="mb-6">
            <TaskCreator
              onTaskCreate={handleCreateTask}
              onCancel={() => setShowTaskCreator(false)}
            />
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agent Society</TabsTrigger>
            <TabsTrigger value="tasks">Task Management</TabsTrigger>
            <TabsTrigger value="results">Workflow Results</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-conductor-bg" />
                    <div>
                      <p className="text-2xl font-bold">1</p>
                      <p className="text-sm text-muted-foreground">Conductor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-department-bg" />
                    <div>
                      <p className="text-2xl font-bold">{departmentHeads.length}</p>
                      <p className="text-sm text-muted-foreground">Department Heads</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{regularAgents.length}</p>
                      <p className="text-sm text-muted-foreground">Agents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-consciousness-glow" />
                    <div>
                      <p className="text-2xl font-bold">{completedTasks.length}</p>
                      <p className="text-sm text-muted-foreground">Tasks Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conductor Overview */}
            {conductor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-conductor-bg" />
                    System Conductor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AgentCard agent={conductor} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            {conductor && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-conductor-bg" />
                  System Conductor
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AgentCard agent={conductor} />
                </div>
              </div>
            )}

            {departmentHeads.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-department-bg" />
                  Department Heads
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {departmentHeads.map(agent => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </div>
            )}

            {regularAgents.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Specialist Agents
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {regularAgents.map(agent => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </div>
            )}

            {agents.length === 1 && (
              <Card className="text-center p-8">
                <CardContent>
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Build Your Agent Society</h3>
                  <p className="text-muted-foreground mb-4">
                    Create specialized agents to work with your Conductor and form a powerful AI collective.
                  </p>
                  <Button onClick={() => setShowAgentCreator(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Agent
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Pending Tasks</h3>
                <div className="space-y-4">
                  {pendingTasks.map(task => (
                    <Card key={task.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{task.title}</h4>
                            <p className="text-muted-foreground mt-1">{task.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{task.complexity}</Badge>
                              <div className="flex gap-1">
                                {task.requirements.map(req => (
                                  <Badge key={req} variant="secondary" className="text-xs">
                                    {req}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleExecuteTask(task)}
                            disabled={executingTask === task.id}
                            className="ml-4"
                          >
                            {executingTask === task.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Play className="h-4 w-4 mr-2" />
                            )}
                            Execute
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Completed Tasks</h3>
                <div className="space-y-4">
                  {completedTasks.map(task => (
                    <Card key={task.id} className="opacity-75">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{task.title}</h4>
                            <p className="text-muted-foreground mt-1">{task.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge>Completed</Badge>
                              <Badge variant="outline">{task.complexity}</Badge>
                              {task.completedAt && (
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(task.completedAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {tasks.length === 0 && (
              <Card className="text-center p-8">
                <CardContent>
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Tasks Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first task to see the agent society in action.
                  </p>
                  <Button onClick={() => setShowTaskCreator(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Task
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map(result => (
                  <Card key={result.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">Task Result</h4>
                          <p className="text-sm text-muted-foreground">
                            Agent: {agentSystem.getAgent(result.agentId)?.name || 'Unknown'}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={result.quality > 0.8 ? 'default' : result.quality > 0.6 ? 'secondary' : 'destructive'}>
                            Quality: {(result.quality * 100).toFixed(1)}%
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {result.processingTime}ms
                          </p>
                        </div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm">{result.result}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(result.timestamp).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center p-8">
                <CardContent>
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Results Yet</h3>
                  <p className="text-muted-foreground">
                    Execute tasks to see workflow results from the agent society.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
