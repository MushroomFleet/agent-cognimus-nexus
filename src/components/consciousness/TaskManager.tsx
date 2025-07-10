import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Task, Persona, NewTask } from '@/types/task';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';

interface TaskManagerProps {
  onUpdate: () => void;
}

export function TaskManager({ onUpdate }: TaskManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const createTask = async (newTask: NewTask) => {
    if (!user) return;

    try {
      const taskData = {
        user_id: user.id,
        title: newTask.title,
        description: newTask.description,
        assigned_to: newTask.assignedTo === 'auto' ? null : newTask.assignedTo || null,
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
          <TaskForm
            open={showCreateTask}
            onOpenChange={setShowCreateTask}
            personas={personas}
            onSubmit={createTask}
          />
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
              {taskList.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdateStatus={updateTaskStatus}
                />
              ))}
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