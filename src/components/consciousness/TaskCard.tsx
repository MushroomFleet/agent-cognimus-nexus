import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Users, Bot, Sparkles } from 'lucide-react';
import { Task } from '@/types/task';
import { STATUS_ICONS, STATUS_COLORS } from './TaskConstants';

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
}

export function TaskCard({ task, onUpdateStatus }: TaskCardProps) {
  const StatusIcon = STATUS_ICONS[task.status];
  
  return (
    <Card className="relative">
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
            <div className="flex items-center gap-1 mb-1">
              <Sparkles className="h-3 w-3 text-primary" />
              <p className="text-sm text-muted-foreground">AI Generated Result:</p>
            </div>
            <div className="bg-muted/50 rounded-md p-3">
              <p className="text-sm whitespace-pre-wrap">{task.result}</p>
            </div>
          </div>
        )}

        {task.status === 'in_progress' && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-1">
              <Bot className="h-3 w-3 text-primary animate-pulse" />
              <p className="text-sm text-primary font-medium">AI processing in progress...</p>
            </div>
          </div>
        )}

        {task.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(task.id, 'in_progress')}
            >
              Start Task
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(task.id, 'completed')}
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
              onClick={() => onUpdateStatus(task.id, 'completed')}
            >
              Complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus(task.id, 'failed')}
            >
              Mark Failed
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}