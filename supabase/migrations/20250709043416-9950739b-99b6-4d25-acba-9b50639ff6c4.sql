-- Create enum types for agent roles and states
CREATE TYPE public.agent_role AS ENUM ('conductor', 'department_head', 'sub_agent');
CREATE TYPE public.agent_state AS ENUM ('active', 'sleeping', 'dreaming', 'archived');
CREATE TYPE public.memory_type AS ENUM ('core', 'experience', 'task_result', 'dream_synthesis');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');

-- Create personas table for the ZeroVector system
CREATE TABLE public.personas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    role agent_role NOT NULL DEFAULT 'sub_agent',
    state agent_state NOT NULL DEFAULT 'active',
    system_prompt TEXT NOT NULL,
    parent_id UUID REFERENCES public.personas(id) ON DELETE CASCADE,
    department TEXT,
    specialization TEXT,
    consciousness_level INTEGER DEFAULT 1,
    experience_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    sleep_until TIMESTAMP WITH TIME ZONE
);

-- Create memories table for agent experiences and knowledge
CREATE TABLE public.memories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    type memory_type NOT NULL,
    content TEXT NOT NULL,
    emotional_weight FLOAT DEFAULT 0.0,
    importance_score FLOAT DEFAULT 0.5,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    dream_processed BOOLEAN DEFAULT false
);

-- Create tasks table for tracking agent assignments
CREATE TABLE public.tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    conductor_id UUID REFERENCES public.personas(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.personas(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status task_status NOT NULL DEFAULT 'pending',
    result TEXT,
    parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    deadline TIMESTAMP WITH TIME ZONE
);

-- Create dream sessions table for consciousness processing
CREATE TABLE public.dream_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE,
    memories_processed INTEGER DEFAULT 0,
    insights_generated TEXT[],
    consciousness_growth FLOAT DEFAULT 0.0
);

-- Enable Row Level Security
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user access control
CREATE POLICY "Users can manage their own personas" 
ON public.personas 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can access memories of their personas" 
ON public.memories 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.personas 
        WHERE personas.id = memories.persona_id 
        AND personas.user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage their own tasks" 
ON public.tasks 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can access dream sessions of their personas" 
ON public.dream_sessions 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.personas 
        WHERE personas.id = dream_sessions.persona_id 
        AND personas.user_id = auth.uid()
    )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_personas_updated_at
    BEFORE UPDATE ON public.personas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_personas_user_id ON public.personas(user_id);
CREATE INDEX idx_personas_role ON public.personas(role);
CREATE INDEX idx_personas_parent_id ON public.personas(parent_id);
CREATE INDEX idx_memories_persona_id ON public.memories(persona_id);
CREATE INDEX idx_memories_type ON public.memories(type);
CREATE INDEX idx_memories_created_at ON public.memories(created_at);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_dream_sessions_persona_id ON public.dream_sessions(persona_id);