import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Brain, Clock, User, Heart, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Memory {
  id: string;
  persona_id: string;
  type: 'core' | 'experience' | 'task_result' | 'dream_synthesis';
  content: string;
  emotional_weight: number;
  importance_score: number;
  tags?: string[];
  created_at: string;
  dream_processed: boolean;
  personas?: {
    name: string;
    role: string;
  };
}

interface MemoryModalProps {
  memory: Memory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MEMORY_TYPE_LABELS = {
  core: 'Core Memory',
  experience: 'Experience',
  task_result: 'Task Result',
  dream_synthesis: 'Dream Synthesis'
};

const MEMORY_TYPE_COLORS = {
  core: 'bg-blue-500',
  experience: 'bg-green-500',
  task_result: 'bg-orange-500',
  dream_synthesis: 'bg-purple-500'
};

export function MemoryModal({ memory, open, onOpenChange }: MemoryModalProps) {
  const { toast } = useToast();

  if (!memory) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(memory.content);
    toast({
      title: "Copied to clipboard",
      description: "Memory content copied successfully",
    });
  };

  const getImportanceIcon = (score: number) => {
    if (score >= 0.8) return <Star className="h-4 w-4 text-yellow-500 fill-current" />;
    if (score >= 0.6) return <Star className="h-4 w-4 text-yellow-500" />;
    return null;
  };

  const getEmotionalColor = (weight: number) => {
    if (weight > 0.5) return 'text-red-500';
    if (weight > 0) return 'text-orange-500';
    if (weight < -0.5) return 'text-blue-500';
    if (weight < 0) return 'text-cyan-500';
    return 'text-gray-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Memory Record
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Memory Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Memory Type</h4>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${MEMORY_TYPE_COLORS[memory.type]}`} />
                <Badge variant="outline">{MEMORY_TYPE_LABELS[memory.type]}</Badge>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Importance</h4>
              <div className="flex items-center gap-2">
                {getImportanceIcon(memory.importance_score)}
                <span className="text-sm">{(memory.importance_score * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Persona</h4>
              <div className="flex items-center gap-1">
                {memory.personas && (
                  <>
                    <User className="h-3 w-3" />
                    <span className="text-sm">{memory.personas.name}</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Created</h4>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-3 w-3" />
                {new Date(memory.created_at).toLocaleString()}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Emotional Weight</h4>
              <div className="flex items-center gap-1">
                <Heart className={`h-3 w-3 ${getEmotionalColor(memory.emotional_weight)}`} />
                <span className="text-sm">{memory.emotional_weight.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Dream Status</h4>
              {memory.dream_processed ? (
                <Badge variant="secondary" className="text-xs">
                  Dream Processed
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">Awaiting dreams</span>
              )}
            </div>
          </div>

          {/* Tags */}
          {memory.tags && memory.tags.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {memory.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Memory Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                <Brain className="h-3 w-3" />
                Memory Content
              </h4>
              <Button size="sm" variant="outline" onClick={copyToClipboard} className="gap-1">
                <Copy className="h-3 w-3" />
                Copy
              </Button>
            </div>
            <ScrollArea className="h-64 w-full">
              <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border">
                <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                  {memory.content}
                </pre>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}