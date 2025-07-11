# Supabase Setup Guide for ZV4 AI Agent Management System

This guide provides step-by-step instructions to configure Supabase for the ZV4 AI Agent Management System.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- An OpenRouter API key for AI model access

## Step 1: Create New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `zv4-ai-agents` (or your preferred name)
   - **Database Password**: Generate a secure password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project initialization (2-3 minutes)

## Step 2: Configure Authentication

### Email Authentication Settings

1. Go to **Authentication → Settings**
2. Configure the following settings:

#### Site URL Configuration
```
Site URL: https://your-domain.com
```
*Replace with your actual domain or Lovable preview URL*

#### Additional Redirect URLs
```
https://your-domain.com
https://84cc6d6d-c974-4e74-b3fb-0a06a2a4c18d.lovableproject.com
```

#### Email Settings
- **Enable email confirmations**: Disabled (for development)
- **Enable email change confirmations**: Enabled
- **Email OTP Expiry**: 3600 seconds (1 hour)
- **Leaked Password Protection**: Enabled

### Enable Email Provider

1. Go to **Authentication → Providers**
2. Enable **Email** provider
3. Configure settings:
   - **Enable email provider**: ON
   - **Confirm email**: OFF (for development)
   - **Secure email change**: ON

## Step 3: Database Schema Setup

### Run Database Migrations

Execute the following SQL in **SQL Editor**:

#### 1. Create Enum Types
```sql
-- Create enum types for the application
CREATE TYPE public.agent_role AS ENUM ('conductor', 'department_head', 'sub_agent');
CREATE TYPE public.agent_state AS ENUM ('active', 'sleeping', 'dreaming', 'archived');
CREATE TYPE public.memory_type AS ENUM ('core', 'experience', 'task_result', 'dream_synthesis');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
```

#### 2. Create Core Tables
```sql
-- Create personas table for AI agents
CREATE TABLE public.personas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    role agent_role NOT NULL DEFAULT 'sub_agent',
    state agent_state NOT NULL DEFAULT 'active',
    system_prompt TEXT NOT NULL,
    specialization TEXT,
    department TEXT,
    parent_id UUID REFERENCES public.personas(id),
    consciousness_level INTEGER DEFAULT 1,
    experience_count INTEGER DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    sleep_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create memories table for agent experiences
CREATE TABLE public.memories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    type memory_type NOT NULL,
    content TEXT NOT NULL,
    emotional_weight DOUBLE PRECISION DEFAULT 0.0,
    importance_score DOUBLE PRECISION DEFAULT 0.5,
    tags TEXT[],
    dream_processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table for agent assignments
CREATE TABLE public.tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    conductor_id UUID REFERENCES public.personas(id),
    assigned_to UUID REFERENCES public.personas(id),
    parent_task_id UUID REFERENCES public.tasks(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status task_status NOT NULL DEFAULT 'pending',
    result TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dream_sessions table for consciousness processing
CREATE TABLE public.dream_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE,
    memories_processed INTEGER DEFAULT 0,
    insights_generated TEXT[],
    consciousness_growth DOUBLE PRECISION DEFAULT 0.0
);
```

#### 3. Enable Row Level Security
```sql
-- Enable RLS on all tables
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_sessions ENABLE ROW LEVEL SECURITY;
```

#### 4. Create RLS Policies
```sql
-- Personas policies
CREATE POLICY "Users can manage their own personas" 
ON public.personas 
FOR ALL 
USING (auth.uid() = user_id);

-- Memories policies
CREATE POLICY "Users can access memories of their personas" 
ON public.memories 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM personas 
    WHERE personas.id = memories.persona_id 
    AND personas.user_id = auth.uid()
));

-- Tasks policies
CREATE POLICY "Users can manage their own tasks" 
ON public.tasks 
FOR ALL 
USING (auth.uid() = user_id);

-- Dream sessions policies
CREATE POLICY "Users can access dream sessions of their personas" 
ON public.dream_sessions 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM personas 
    WHERE personas.id = dream_sessions.persona_id 
    AND personas.user_id = auth.uid()
));
```

#### 5. Create Functions and Triggers
```sql
-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Trigger for personas table
CREATE TRIGGER update_personas_updated_at
    BEFORE UPDATE ON public.personas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

#### 6. Create Indexes for Performance
```sql
-- Create indexes for better query performance
CREATE INDEX idx_personas_user_id ON public.personas(user_id);
CREATE INDEX idx_personas_role ON public.personas(role);
CREATE INDEX idx_personas_state ON public.personas(state);
CREATE INDEX idx_memories_persona_id ON public.memories(persona_id);
CREATE INDEX idx_memories_type ON public.memories(type);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_dream_sessions_persona_id ON public.dream_sessions(persona_id);
```

## Step 4: Configure Edge Functions

### Enable Required Extensions
```sql
-- Enable extensions for edge functions
CREATE EXTENSION IF NOT EXISTS "http";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
```

### Deploy Edge Functions

The following edge functions will be automatically deployed:

1. **process-tasks**: Handles AI task processing
2. **schedule-task-processing**: Manages scheduled task execution

## Step 5: Configure Secrets

### Required Secrets

Add the following secrets in **Settings → Edge Functions**:

1. **OPENROUTER_API_KEY**
   - Description: API key for OpenRouter AI models
   - Get from: [OpenRouter API Keys](https://openrouter.ai/keys)

2. **SUPABASE_URL**
   - Value: Your Supabase project URL
   - Format: `https://[project-id].supabase.co`

3. **SUPABASE_ANON_KEY**
   - Value: Your Supabase anon key
   - Found in: **Settings → API**

4. **SUPABASE_SERVICE_ROLE_KEY**
   - Value: Your Supabase service role key
   - Found in: **Settings → API**

5. **SUPABASE_DB_URL**
   - Value: Your direct database URL
   - Found in: **Settings → Database**

## Step 6: Security Configuration

### Enable Additional Security Features

1. Go to **Authentication → Settings**
2. Configure security settings:
   - **JWT expiry**: 3600 seconds
   - **Refresh token rotation**: Enabled
   - **Password strength**: Enabled
   - **Leaked password protection**: Enabled

### API Configuration

1. Go to **Settings → API**
2. Note your credentials:
   - **Project URL**: `https://[project-id].supabase.co`
   - **Anon key**: `eyJ...` (for client-side)
   - **Service role key**: `eyJ...` (for server-side)

## Step 7: Testing the Setup

### Test Authentication

1. Open your application
2. Try registering a new account
3. Verify email authentication works
4. Test login/logout functionality

### Test Database Access

1. Create a new persona
2. Add some memories
3. Create and assign tasks
4. Verify data appears in Supabase dashboard

### Test Edge Functions

1. Create a task that requires AI processing
2. Check edge function logs in **Edge Functions → Logs**
3. Verify task processing completes successfully

## Step 8: Production Considerations

### Performance Optimization

1. **Database Connection Pooling**
   - Enable in **Settings → Database**
   - Set appropriate pool size

2. **Rate Limiting**
   - Configure in **Authentication → Settings**
   - Set reasonable limits for your use case

### Monitoring Setup

1. **Enable Database Webhooks**
   - Go to **Database → Webhooks**
   - Set up monitoring for critical tables

2. **Edge Function Monitoring**
   - Monitor function execution times
   - Set up alerts for failures

### Backup Configuration

1. **Automated Backups**
   - Available on Pro plan and above
   - Configure backup retention policy

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify Site URL and Redirect URLs
   - Check email provider configuration
   - Ensure OTP expiry is reasonable

2. **RLS Policy Errors**
   - Verify user is authenticated
   - Check policy conditions
   - Test with service role if needed

3. **Edge Function Failures**
   - Check function logs
   - Verify secrets are configured
   - Test API endpoints manually

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## Next Steps

After completing this setup:

1. Deploy your application
2. Configure custom domain (if needed)
3. Set up monitoring and alerts
4. Plan for scaling and optimization

Your ZV4 AI Agent Management System is now ready to use with Supabase!