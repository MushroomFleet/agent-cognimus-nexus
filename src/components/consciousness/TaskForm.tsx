import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Persona, NewTask } from '@/types/task';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personas: Persona[];
  onSubmit: (task: NewTask) => void;
}

export function TaskForm({ open, onOpenChange, personas, onSubmit }: TaskFormProps) {
  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    description: '',
    assignedTo: '',
    deadline: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newTask);
    setNewTask({ title: '', description: '', assignedTo: '', deadline: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <SelectItem value="auto">Auto-assign (Conductor choice)</SelectItem>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}