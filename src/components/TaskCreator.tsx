import { useState } from 'react';
import { Task } from '@/types/agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface TaskCreatorProps {
  onTaskCreate: (task: Task) => void;
  onCancel: () => void;
}

export function TaskCreator({ onTaskCreate, onCancel }: TaskCreatorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [complexity, setComplexity] = useState<'simple' | 'medium' | 'complex'>('medium');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');

  const addRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (req: string) => {
    setRequirements(requirements.filter(r => r !== req));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      complexity,
      requirements,
      status: 'pending',
      createdAt: new Date().toISOString(),
      subtasks: []
    };

    onTaskCreate(newTask);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Task Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what needs to be accomplished..."
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Complexity</label>
            <Select value={complexity} onValueChange={(value: 'simple' | 'medium' | 'complex') => setComplexity(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple - Quick, straightforward task</SelectItem>
                <SelectItem value="medium">Medium - Requires some analysis</SelectItem>
                <SelectItem value="complex">Complex - Multi-step process</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Requirements</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add a requirement..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" onClick={addRequirement} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {requirements.map((req) => (
                <Badge key={req} variant="secondary" className="cursor-pointer" onClick={() => removeRequirement(req)}>
                  {req}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Create Task
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}