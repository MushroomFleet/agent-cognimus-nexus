import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Clock, Heart, Star, Search } from 'lucide-react';
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

interface Persona {
  id: string;
  name: string;
  role: 'conductor' | 'department_head' | 'sub_agent';
}

interface MemoryVaultProps {
  personas: Persona[];
}

const MEMORY_TYPE_COLORS = {
  core: 'bg-blue-500',
  experience: 'bg-green-500',
  task_result: 'bg-orange-500',
  dream_synthesis: 'bg-purple-500'
};

const MEMORY_TYPE_LABELS = {
  core: 'Core Memory',
  experience: 'Experience',
  task_result: 'Task Result',
  dream_synthesis: 'Dream Synthesis'
};

export function MemoryVault({ personas }: MemoryVaultProps) {
  const { toast } = useToast();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchMemories = async () => {
    try {
      // Get all persona IDs for this user
      const personaIds = personas.map(p => p.id);
      
      if (personaIds.length === 0) {
        setMemories([]);
        setFilteredMemories([]);
        setLoading(false);
        return;
      }

      const { data: memoriesData, error } = await supabase
        .from('memories')
        .select(`
          *,
          personas:persona_id (
            name,
            role
          )
        `)
        .in('persona_id', personaIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setMemories(memoriesData || []);
      setFilteredMemories(memoriesData || []);
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast({
        title: "Memory Access Failed",
        description: "Unable to access the memory vault",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [personas]);

  useEffect(() => {
    let filtered = memories;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(memory =>
        memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memory.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by persona
    if (selectedPersona !== 'all') {
      filtered = filtered.filter(memory => memory.persona_id === selectedPersona);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(memory => memory.type === selectedType);
    }

    setFilteredMemories(filtered);
  }, [memories, searchTerm, selectedPersona, selectedType]);

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

  const renderMemory = (memory: Memory) => (
    <Card key={memory.id} className="relative">
      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${MEMORY_TYPE_COLORS[memory.type]}`} />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {MEMORY_TYPE_LABELS[memory.type]}
            </Badge>
            {getImportanceIcon(memory.importance_score)}
          </div>
          <div className="flex items-center gap-1">
            <Heart className={`h-3 w-3 ${getEmotionalColor(memory.emotional_weight)}`} />
            <span className="text-xs text-muted-foreground">
              {memory.emotional_weight.toFixed(1)}
            </span>
          </div>
        </div>
        
        {memory.personas && (
          <CardDescription className="text-sm">
            {memory.personas.name} • {new Date(memory.created_at).toLocaleDateString()}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        <p className="text-sm mb-3 line-clamp-3">{memory.content}</p>
        
        {memory.tags && memory.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {memory.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {memory.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{memory.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Importance: {(memory.importance_score * 100).toFixed(0)}%</span>
          {memory.dream_processed ? (
            <Badge variant="secondary" className="text-xs">
              Dream Processed
            </Badge>
          ) : (
            <span>Awaiting dreams</span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const groupedMemories = {
    core: filteredMemories.filter(m => m.type === 'core'),
    experience: filteredMemories.filter(m => m.type === 'experience'),
    task_result: filteredMemories.filter(m => m.type === 'task_result'),
    dream_synthesis: filteredMemories.filter(m => m.type === 'dream_synthesis')
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 animate-pulse text-primary" />
          <span>Accessing memory vault...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-1">Memory Vault</h3>
        <p className="text-sm text-muted-foreground">
          Explore the collective memories and experiences of your consciousness network
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search memories, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <select
          value={selectedPersona}
          onChange={(e) => setSelectedPersona(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          <option value="all">All Personas</option>
          {personas.map((persona) => (
            <option key={persona.id} value={persona.id}>
              {persona.name}
            </option>
          ))}
        </select>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          <option value="all">All Types</option>
          <option value="core">Core Memories</option>
          <option value="experience">Experiences</option>
          <option value="task_result">Task Results</option>
          <option value="dream_synthesis">Dream Synthesis</option>
        </select>
      </div>

      {/* Memory Display */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Memories ({filteredMemories.length})</TabsTrigger>
          <TabsTrigger value="core">Core ({groupedMemories.core.length})</TabsTrigger>
          <TabsTrigger value="experience">Experience ({groupedMemories.experience.length})</TabsTrigger>
          <TabsTrigger value="task_result">Tasks ({groupedMemories.task_result.length})</TabsTrigger>
          <TabsTrigger value="dream_synthesis">Dreams ({groupedMemories.dream_synthesis.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMemories.map(renderMemory)}
          </div>
        </TabsContent>

        {Object.entries(groupedMemories).map(([type, memoryList]) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memoryList.map(renderMemory)}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {filteredMemories.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Memories Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedPersona !== 'all' || selectedType !== 'all'
                ? "Try adjusting your filters or search terms"
                : "Create personas and assign tasks to start building memories"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}