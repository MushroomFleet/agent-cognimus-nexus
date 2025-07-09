import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Clock, CheckCircle, XCircle, Users, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
  created_at: string;
  completed_at?: string;
  deadline?: string;
  assigned_to?: string;
  conductor_id?: string;
  personas?: {
    name: string;
    role: string;
  } | null;
}

interface Persona {
  id: string;
  name: string;
  role: 'conductor' | 'department_head' | 'sub_agent';
  state: 'active' | 'sleeping' | 'dreaming' | 'archived';
}

interface TaskManagerProps {
  onUpdate: () => void;
}

const STATUS_ICONS = {
  pending: Clock,
  in_progress: Users,
  completed: CheckCircle,
  failed: XCircle
};

const STATUS_COLORS = {
  pending: 'bg-yellow-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500'
};

export function TaskManager({ onUpdate }: TaskManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    deadline: ''
  });

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);

      // Fetch active personas for assignment
      const { data: personasData, error: personasError } = await supabase
        .from('personas')
        .select('id, name, role, state')
        .eq('user_id', user.id)
        .eq('state', 'active')
        .order('name');

      if (personasError) throw personasError;
      setPersonas(personasData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Data Fetch Failed",
        description: "Unable to load tasks and personas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const taskData = {
        user_id: user.id,
        title: newTask.title,
        description: newTask.description,
        assigned_to: newTask.assignedTo || null,
        deadline: newTask.deadline || null,
        status: 'pending' as const
      };

      const { error } = await supabase
        .from('tasks')
        .insert(taskData);

      if (error) throw error;

      toast({
        title: "Task Created",
        description: "Task has been assigned to the consciousness network",
      });

      setNewTask({ title: '', description: '', assignedTo: '', deadline: '' });
      setShowCreateTask(false);
      fetchData();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Task Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const updates: any = { status };
      if (status === 'completed' || status === 'failed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Task Updated",
        description: `Task marked as ${status}`,
      });

      fetchData();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderTask = (task: Task) => {
    const StatusIcon = STATUS_ICONS[task.status];
    
    return (
      <Card key={task.id} className="relative">
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${STATUS_COLORS[task.status]}`} />
        
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">{task.title}</CardTitle>
          </div>
          <CardDescription className="line-clamp-2">
            {task.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge 
              variant={task.status === 'completed' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {task.status.replace('_', ' ')}
            </Badge>
          </div>

          {task.personas && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Assigned To</span>
              <div className="flex items-center gap-1">
                {task.personas.role === 'conductor' && <Brain className="h-3 w-3" />}
                {task.personas.role === 'department_head' && <Users className="h-3 w-3" />}
                <span className="font-medium">{task.personas.name}</span>
              </div>
            </div>
          )}

          {task.deadline && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Deadline</span>
              <span className="font-medium">
                {new Date(task.deadline).toLocaleDateString()}
              </span>
            </div>
          )}

          {task.result && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground mb-1">Result:</p>
              <p className="text-sm">{task.result}</p>
            </div>
          )}

          {task.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateTaskStatus(task.id, 'in_progress')}
              >
                Start Task
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateTaskStatus(task.id, 'completed')}
              >
                Complete
              </Button>
            </div>
          )}

          {task.status === 'in_progress' && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateTaskStatus(task.id, 'completed')}
              >
                Complete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateTaskStatus(task.id, 'failed')}
              >
                Mark Failed
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 animate-spin text-primary" />
          <span>Loading task network...</span>
        </div>
      </div>
    );
  }

  const groupedTasks = {
    pending: tasks.filter(t => t.status === 'pending'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
    failed: tasks.filter(t => t.status === 'failed')
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Task Distribution Network</h3>
          <p className="text-sm text-muted-foreground">
            Manage and monitor tasks across the consciousness collective
          </p>
        </div>
        
        <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={createTask} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="Analyze market trends..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed task requirements and context..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign To Persona</Label>
                <Select 
                  value={newTask.assignedTo} 
                  onValueChange={(value) => setNewTask({...newTask, assignedTo: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-assign or select persona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Auto-assign (Conductor choice)</SelectItem>
                    {personas.map((persona) => (
                      <SelectItem key={persona.id} value={persona.id}>
                        {persona.name} ({persona.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowCreateTask(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Task</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {Object.entries(groupedTasks).map(([status, taskList]) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-medium capitalize">{status.replace('_', ' ')}</h4>
              <Badge variant="secondary">{taskList.length}</Badge>
            </div>
            
            <div className="space-y-3">
              {taskList.map(renderTask)}
              {taskList.length === 0 && (
                <Card className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No {status.replace('_', ' ')} tasks
                  </p>
                </Card>
              )}
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Tasks Created</h3>
            <p className="text-muted-foreground mb-6">
              Create tasks to distribute work across your consciousness network
            </p>
            <Button onClick={() => setShowCreateTask(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Task
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}