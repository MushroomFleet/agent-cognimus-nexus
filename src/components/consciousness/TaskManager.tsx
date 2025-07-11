import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Clock, Brain, Zap, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Task, Persona, NewTask } from '@/types/task';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { TaskConsole } from './TaskConsole';

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
  const [processing, setProcessing] = useState(false);
  const [pendingTaskCount, setPendingTaskCount] = useState(0);

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
      
      // Update pending task count (including in_progress for processing)
      const pending = tasksData?.filter(t => t.status === 'pending' || t.status === 'in_progress').length || 0;
      setPendingTaskCount(pending);

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
    
    // Set up real-time subscriptions
    const tasksSubscription = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          console.log('Task change detected, refetching data...');
          fetchData();
        }
      )
      .subscribe();

    const personasSubscription = supabase
      .channel('personas_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'personas',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          console.log('Persona change detected, refetching data...');
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksSubscription);
      supabase.removeChannel(personasSubscription);
    };
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

  const processPendingTasks = useCallback(async () => {
    if (!user || processing) return;

    console.log('Starting task processing...');
    setProcessing(true);
    try {
      console.log('Invoking process-tasks function...');
      const { data, error } = await supabase.functions.invoke('process-tasks');
      
      console.log('Function response:', { data, error });
      
      if (error) {
        console.error('Task processing error:', error);
        toast({
          title: "Processing Error",
          description: `Failed to process tasks: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('Task processing result:', data);
        toast({
          title: "AI Processing Complete",
          description: data?.message || "Tasks processed by consciousness network",
        });
      }
    } catch (error: any) {
      console.error('Task processing error caught:', error);
      toast({
        title: "Processing Error",
        description: error.message || "Failed to process tasks",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  }, [user, processing, toast]);

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
          {pendingTaskCount > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                {pendingTaskCount} task{pendingTaskCount === 1 ? '' : 's'} ready for AI processing
              </span>
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          {pendingTaskCount > 0 && (
            <Button 
              onClick={processPendingTasks}
              disabled={processing}
              variant="outline"
              className="gap-2"
            >
              {processing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {processing ? 'Processing...' : 'Process with AI'}
            </Button>
          )}
          
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

      {/* Live Console */}
      <TaskConsole isProcessing={processing} />
    </div>
  );
}