import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Sparkles, Clock, User } from 'lucide-react';
import { Task } from '@/types/task';
import { useToast } from '@/hooks/use-toast';

interface TaskResponseModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskResponseModal({ task, open, onOpenChange }: TaskResponseModalProps) {
  const { toast } = useToast();

  if (!task) return null;

  const copyToClipboard = () => {
    if (task.result) {
      navigator.clipboard.writeText(task.result);
      toast({
        title: "Copied to clipboard",
        description: "Task result copied successfully",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Task Response
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Task Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Task Title</h4>
              <p className="font-medium">{task.title}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Status</h4>
              <Badge variant={task.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Assigned To</h4>
              <div className="flex items-center gap-1">
                {task.personas && (
                  <>
                    <User className="h-3 w-3" />
                    <span className="text-sm">{task.personas.name}</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Completed</h4>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-3 w-3" />
                {task.completed_at ? new Date(task.completed_at).toLocaleString() : 'Not completed'}
              </div>
            </div>
          </div>

          {/* Task Description */}
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Task Description</h4>
            <div className="p-3 bg-muted/30 rounded-md">
              <p className="text-sm whitespace-pre-wrap">{task.description}</p>
            </div>
          </div>

          {/* AI Response */}
          {task.result && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Generated Response
                </h4>
                <Button size="sm" variant="outline" onClick={copyToClipboard} className="gap-1">
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>
              <ScrollArea className="h-64 w-full">
                <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border">
                  <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                    {task.result}
                  </pre>
                </div>
              </ScrollArea>
            </div>
          )}

          {!task.result && (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No AI response available for this task</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}