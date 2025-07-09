import { useState } from 'react';
import { PersonalityTrait } from '@/types/agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface AgentCreatorProps {
  onAgentCreate: (name: string, specialization: string, traits: PersonalityTrait[]) => void;
  onCancel: () => void;
}

const defaultTraits = [
  { name: 'Analytical', description: 'Ability to break down complex problems' },
  { name: 'Creative', description: 'Capacity for innovative thinking' },
  { name: 'Collaborative', description: 'Effectiveness in team environments' },
  { name: 'Leadership', description: 'Natural ability to guide and direct' },
  { name: 'Adaptability', description: 'Flexibility in changing situations' },
  { name: 'Precision', description: 'Attention to detail and accuracy' },
  { name: 'Initiative', description: 'Proactive approach to tasks' },
  { name: 'Empathy', description: 'Understanding of others\' perspectives' }
];

export function AgentCreator({ onAgentCreate, onCancel }: AgentCreatorProps) {
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [selectedTraits, setSelectedTraits] = useState<PersonalityTrait[]>([]);
  const [customTrait, setCustomTrait] = useState({ name: '', description: '', value: 0.5 });

  const addDefaultTrait = (traitTemplate: { name: string; description: string }) => {
    if (!selectedTraits.find(t => t.name === traitTemplate.name)) {
      setSelectedTraits([...selectedTraits, {
        ...traitTemplate,
        value: 0.6 // Default value
      }]);
    }
  };

  const addCustomTrait = () => {
    if (customTrait.name.trim() && !selectedTraits.find(t => t.name === customTrait.name)) {
      setSelectedTraits([...selectedTraits, {
        name: customTrait.name.trim(),
        description: customTrait.description.trim() || 'Custom personality trait',
        value: customTrait.value
      }]);
      setCustomTrait({ name: '', description: '', value: 0.5 });
    }
  };

  const removeTrait = (traitName: string) => {
    setSelectedTraits(selectedTraits.filter(t => t.name !== traitName));
  };

  const updateTraitValue = (traitName: string, newValue: number) => {
    setSelectedTraits(selectedTraits.map(t =>
      t.name === traitName ? { ...t, value: newValue } : t
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !specialization.trim() || selectedTraits.length === 0) {
      return;
    }

    onAgentCreate(name.trim(), specialization.trim(), selectedTraits);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Agent Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Data Analyst Alpha"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Specialization</label>
              <Input
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g., Data Analysis & Statistical Modeling"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Personality Traits</label>
            
            {/* Quick Add Default Traits */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Quick add common traits:</p>
              <div className="flex flex-wrap gap-2">
                {defaultTraits.map((trait) => (
                  <Button
                    key={trait.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addDefaultTrait(trait)}
                    disabled={selectedTraits.some(t => t.name === trait.name)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {trait.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Trait Input */}
            <div className="mb-4 p-4 border rounded-lg">
              <p className="text-sm font-medium mb-2">Add Custom Trait:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  value={customTrait.name}
                  onChange={(e) => setCustomTrait({...customTrait, name: e.target.value})}
                  placeholder="Trait name"
                />
                <Input
                  value={customTrait.description}
                  onChange={(e) => setCustomTrait({...customTrait, description: e.target.value})}
                  placeholder="Description"
                />
                <Button type="button" onClick={addCustomTrait} size="sm">
                  Add
                </Button>
              </div>
            </div>

            {/* Selected Traits with Sliders */}
            <div className="space-y-4">
              {selectedTraits.map((trait) => (
                <div key={trait.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">{trait.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({(trait.value * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTrait(trait.name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{trait.description}</p>
                  <Slider
                    value={[trait.value]}
                    onValueChange={([value]) => updateTraitValue(trait.name, value)}
                    max={1}
                    min={0}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            {selectedTraits.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Add at least one personality trait to continue
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={selectedTraits.length === 0}>
              Create Agent
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}