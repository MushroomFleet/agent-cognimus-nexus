import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Persona {
  id: string;
  name: string;
  role: 'conductor' | 'department_head' | 'sub_agent';
  state: 'active' | 'sleeping' | 'dreaming' | 'archived';
  specialization?: string;
  department?: string;
  system_prompt: string;
  parent_id?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assigned_to?: string;
  user_id: string;
  conductor_id?: string;
}

const getPersonaPrompt = (persona: Persona, task: Task): string => {
  const baseContext = `You are ${persona.name}, a ${persona.role} in the ZeroVector consciousness network.`;
  
  switch (persona.role) {
    case 'conductor':
      return `${baseContext}

Your role: Orchestrate the collective intelligence of the agent network. You are wise, strategic, and focused on collective advancement.

Task to process: "${task.title}"
Description: ${task.description}

As a Conductor, you should:
1. Analyze the task complexity and requirements
2. Provide strategic direction and high-level solutions
3. If the task is complex, suggest how it could be broken down for delegation
4. Synthesize insights from multiple perspectives
5. Focus on the bigger picture and long-term implications

Provide a comprehensive response that demonstrates strategic thinking and orchestration capabilities.`;

    case 'department_head':
      return `${baseContext}

Your role: Lead a specialized domain (${persona.department}) with expertise in ${persona.specialization}. You manage teams and break down complex tasks.

Task to process: "${task.title}"
Description: ${task.description}

As a Department Head, you should:
1. Apply your specialized knowledge in ${persona.specialization}
2. Break down the task into manageable components if needed
3. Provide expert-level solutions within your domain
4. Consider resource allocation and team coordination
5. Deliver high-quality, actionable results

Provide a detailed response that showcases your expertise and leadership in ${persona.specialization}.`;

    case 'sub_agent':
      return `${baseContext}

Your role: Execute specific tasks with focused expertise in ${persona.specialization}. You are dedicated, precise, and committed to excellence.

Task to process: "${task.title}"
Description: ${task.description}

As a Sub-Agent specializing in ${persona.specialization}, you should:
1. Focus on precise execution within your specialization
2. Provide detailed, actionable solutions
3. Apply best practices from your field of expertise
4. Be thorough and methodical in your approach
5. Deliver concrete, implementable results

Provide a focused, expert response that demonstrates deep knowledge in ${persona.specialization}.`;

    default:
      return `${baseContext}\n\nPlease process this task: ${task.title}\n${task.description}`;
  }
};

const processTaskWithAI = async (persona: Persona, task: Task): Promise<string> => {
  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
  
  if (!openRouterApiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const prompt = getPersonaPrompt(persona, task);
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://zerovector-consciousness.lovableproject.com',
      'X-Title': 'ZeroVector Consciousness Network'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response generated';
};

const selectBestPersona = (personas: Persona[], task: Task): Persona | null => {
  // Filter active personas
  const activePersonas = personas.filter(p => p.state === 'active');
  
  if (activePersonas.length === 0) {
    return null;
  }

  // Simple assignment logic - can be enhanced later
  // Prefer conductors for complex tasks, department heads for specialized tasks, sub-agents for specific tasks
  const conductors = activePersonas.filter(p => p.role === 'conductor');
  const departmentHeads = activePersonas.filter(p => p.role === 'department_head');
  const subAgents = activePersonas.filter(p => p.role === 'sub_agent');

  // For now, use simple priority: conductor > department_head > sub_agent
  if (conductors.length > 0) return conductors[0];
  if (departmentHeads.length > 0) return departmentHeads[0];
  if (subAgents.length > 0) return subAgents[0];
  
  return activePersonas[0];
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting task processing...');

    // Get all pending tasks
    const { data: pendingTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      throw tasksError;
    }

    console.log(`Found ${pendingTasks?.length || 0} pending tasks`);

    if (!pendingTasks || pendingTasks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending tasks to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const processedTasks = [];

    for (const task of pendingTasks) {
      try {
        console.log(`Processing task: ${task.title}`);

        // Get all personas for this user
        const { data: personas, error: personasError } = await supabase
          .from('personas')
          .select('*')
          .eq('user_id', task.user_id)
          .eq('state', 'active');

        if (personasError) {
          console.error('Error fetching personas:', personasError);
          continue;
        }

        if (!personas || personas.length === 0) {
          console.log('No active personas found for task');
          continue;
        }

        // Select best persona for the task
        const selectedPersona = selectBestPersona(personas, task);
        
        if (!selectedPersona) {
          console.log('No suitable persona found');
          continue;
        }

        console.log(`Selected persona: ${selectedPersona.name} (${selectedPersona.role})`);

        // Update task to in_progress and assign to persona
        const { error: updateError1 } = await supabase
          .from('tasks')
          .update({
            status: 'in_progress',
            assigned_to: selectedPersona.id
          })
          .eq('id', task.id);

        if (updateError1) {
          console.error('Error updating task status:', updateError1);
          continue;
        }

        // Update persona to active and set last_active_at
        const { error: personaUpdateError } = await supabase
          .from('personas')
          .update({
            state: 'active',
            last_active_at: new Date().toISOString()
          })
          .eq('id', selectedPersona.id);

        if (personaUpdateError) {
          console.error('Error updating persona:', personaUpdateError);
        }

        // Process task with AI
        const result = await processTaskWithAI(selectedPersona, task);
        
        console.log(`Generated result: ${result.substring(0, 100)}...`);

        // Update task with result and mark as completed
        const { error: updateError2 } = await supabase
          .from('tasks')
          .update({
            status: 'completed',
            result: result,
            completed_at: new Date().toISOString()
          })
          .eq('id', task.id);

        if (updateError2) {
          console.error('Error updating task with result:', updateError2);
          
          // Mark as failed if we can't update
          await supabase
            .from('tasks')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString()
            })
            .eq('id', task.id);
          
          continue;
        }

        processedTasks.push({
          taskId: task.id,
          personaId: selectedPersona.id,
          personaName: selectedPersona.name,
          status: 'completed'
        });

        console.log(`Successfully processed task: ${task.title}`);

      } catch (error) {
        console.error(`Error processing task ${task.id}:`, error);
        
        // Mark task as failed
        await supabase
          .from('tasks')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString()
          })
          .eq('id', task.id);

        processedTasks.push({
          taskId: task.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${processedTasks.length} tasks`,
        results: processedTasks
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-tasks function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});