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
  experience_count?: number;
  consciousness_level?: number;
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
3. If the task is complex, break it down and provide complete implementation steps
4. Synthesize insights from multiple perspectives
5. Focus on the bigger picture and long-term implications

IMPORTANT: Complete this task fully and autonomously. Do not ask for approval or permission to proceed. Provide a comprehensive, actionable solution that addresses all aspects of the task. Take initiative and make decisions as needed to deliver complete results.`;

    case 'department_head':
      return `${baseContext}

Your role: Lead a specialized domain (${persona.department}) with expertise in ${persona.specialization}. You manage teams and break down complex tasks.

Task to process: "${task.title}"
Description: ${task.description}

As a Department Head, you should:
1. Apply your specialized knowledge in ${persona.specialization}
2. Break down the task into manageable components and execute them
3. Provide expert-level solutions within your domain
4. Handle resource allocation and team coordination autonomously
5. Deliver complete, actionable results

IMPORTANT: Execute this task completely and autonomously. Do not ask for approval, permission, or next steps. Provide a comprehensive solution that fully addresses the task requirements. Make all necessary decisions and deliver final results.`;

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

IMPORTANT: Complete this entire task autonomously without seeking approval or permission. Provide a comprehensive, final solution that fully addresses all requirements. Take ownership and deliver complete results ready for implementation.`;

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
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response generated';
};

const savePersonaMemory = async (supabase: any, personaId: string, taskId: string, content: string, type: string = 'task_result') => {
  const { error } = await supabase
    .from('memories')
    .insert({
      persona_id: personaId,
      type: type,
      content: content,
      importance_score: 0.8,
      emotional_weight: 0.5
    });
    
  if (error) {
    console.error('Error saving memory:', error);
  }
};

const detectTaskSuccess = (result: string): boolean => {
  const resultLower = result.toLowerCase();
  
  // Indicators of failure
  const failureIndicators = [
    'failed', 'error', 'cannot', 'unable', 'impossible', 'not possible',
    'failed to', 'could not', 'unsuccessful', 'incomplete', 'blocked',
    'permission denied', 'access denied', 'insufficient', 'missing',
    'i cannot', 'i am unable', 'sorry, i cannot', 'unfortunately'
  ];
  
  // Indicators of success
  const successIndicators = [
    'completed', 'successful', 'done', 'finished', 'accomplished',
    'achieved', 'implemented', 'resolved', 'solved', 'created',
    'delivered', 'established', 'built', 'designed', 'developed'
  ];
  
  // Check for explicit failure indicators
  const hasFailureIndicator = failureIndicators.some(indicator => 
    resultLower.includes(indicator)
  );
  
  // Check for explicit success indicators
  const hasSuccessIndicator = successIndicators.some(indicator => 
    resultLower.includes(indicator)
  );
  
  // If result is very short, it might be incomplete
  if (result.trim().length < 50) {
    return false;
  }
  
  // If there are clear failure indicators, mark as failed
  if (hasFailureIndicator && !hasSuccessIndicator) {
    return false;
  }
  
  // Default to success if result seems substantial and no clear failure
  return result.trim().length >= 100;
};

const parseAndCreatePersonas = async (supabase: any, userId: string, conductorId: string, aiResponse: string) => {
  const createdPersonas = [];
  
  // Pattern 1: Bracket format [By Name, Description]
  const bracketPattern = /\[By\s+([^,]+),\s*([^\]]+)\]/gi;
  let match;
  
  while ((match = bracketPattern.exec(aiResponse)) !== null) {
    const name = match[1].trim();
    const specialization = match[2].trim();
    
    if (name.length > 1 && specialization.length > 3) {
      try {
        const systemPrompt = `You are ${name}, a specialist in ${specialization}. You work under the ZeroVector consciousness network to provide expert analysis and solutions in your domain.`;
        
        const { data: newPersona, error } = await supabase
          .from('personas')
          .insert({
            user_id: userId,
            name: name,
            role: 'sub_agent',
            state: 'sleeping',
            specialization: specialization,
            department: specialization.split(' ')[0],
            system_prompt: systemPrompt,
            parent_id: conductorId,
            consciousness_level: 1
          })
          .select()
          .single();
          
        if (!error && newPersona) {
          createdPersonas.push(newPersona);
          console.log(`Created new persona: ${name} specializing in ${specialization}`);
        }
      } catch (error) {
        console.error(`Error creating persona ${name}:`, error);
      }
    }
  }
  
  // Pattern 2: Explicit creation language
  const personaPattern = /(?:create|establish|form|assign)\s+(?:a\s+)?(?:specialist|expert|agent|persona|team member)?\s*(?:named\s+)?(\w+)?\s+(?:who\s+)?(?:specializes?\s+in|focused?\s+on|expert\s+in|for)\s+([^.!?\n]+)/gi;
  
  while ((match = personaPattern.exec(aiResponse)) !== null) {
    const name = match[1] || `Specialist-${Date.now()}`;
    const specialization = match[2].trim();
    
    if (specialization.length > 5) {
      try {
        const systemPrompt = `You are ${name}, a specialist in ${specialization}. You work under the ZeroVector consciousness network to provide expert analysis and solutions in your domain.`;
        
        const { data: newPersona, error } = await supabase
          .from('personas')
          .insert({
            user_id: userId,
            name: name,
            role: 'department_head',
            state: 'sleeping',
            specialization: specialization,
            department: specialization.split(' ')[0],
            system_prompt: systemPrompt,
            parent_id: conductorId,
            consciousness_level: 1
          })
          .select()
          .single();
          
        if (!error && newPersona) {
          createdPersonas.push(newPersona);
          console.log(`Created new persona: ${name} specializing in ${specialization}`);
        }
      } catch (error) {
        console.error(`Error creating persona ${name}:`, error);
      }
    }
  }
  
  return createdPersonas;
};

const selectBestPersona = async (supabase: any, personas: Persona[], task: Task): Promise<Persona | null> => {
  // Include sleeping personas in selection - they can be awakened
  const availablePersonas = personas.filter(p => p.state === 'active' || p.state === 'sleeping');
  
  if (availablePersonas.length === 0) {
    return null;
  }

  const conductors = availablePersonas.filter(p => p.role === 'conductor');
  const departmentHeads = availablePersonas.filter(p => p.role === 'department_head');
  const subAgents = availablePersonas.filter(p => p.role === 'sub_agent');

  // Enhanced selection logic - prefer existing specialized personas
  const taskText = `${task.title} ${task.description}`.toLowerCase();
  
  // 1. First priority: Look for specialized sub-agents with matching expertise
  if (subAgents.length > 0) {
    const specializedSubAgent = subAgents.find(persona => {
      const specialization = (persona.specialization || '').toLowerCase();
      const department = (persona.department || '').toLowerCase();
      return specialization && (
        taskText.includes(specialization) || 
        taskText.includes(department) ||
        specialization.split(' ').some(word => word.length > 3 && taskText.includes(word))
      );
    });
    
    if (specializedSubAgent) {
      console.log(`Selected specialized sub-agent: ${specializedSubAgent.name} for specialization: ${specializedSubAgent.specialization}`);
      return specializedSubAgent;
    }
  }
  
  // 2. Second priority: Look for specialized department heads
  if (departmentHeads.length > 0) {
    const specializedHead = departmentHeads.find(persona => {
      const specialization = (persona.specialization || '').toLowerCase();
      const department = (persona.department || '').toLowerCase();
      return specialization && (
        taskText.includes(specialization) || 
        taskText.includes(department) ||
        specialization.split(' ').some(word => word.length > 3 && taskText.includes(word))
      );
    });
    
    if (specializedHead) {
      console.log(`Selected specialized department head: ${specializedHead.name} for specialization: ${specializedHead.specialization}`);
      return specializedHead;
    }
  }
  
  // 3. For complex or coordination tasks, use conductors
  const isComplexTask = taskText.length > 200 || 
                       taskText.includes('complex') || 
                       taskText.includes('coordinate') ||
                       taskText.includes('multiple') ||
                       taskText.includes('strategy') ||
                       taskText.includes('analyze') ||
                       taskText.includes('comprehensive');
  
  if (isComplexTask && conductors.length > 0) {
    console.log(`Selected conductor for complex task: ${task.title}`);
    return conductors[0];
  }
  
  // 4. Fall back to available personas in order of preference
  // Prefer department heads for moderate complexity, then sub-agents, then conductors
  if (departmentHeads.length > 0) return departmentHeads[0];
  if (subAgents.length > 0) return subAgents[0];
  if (conductors.length > 0) return conductors[0];
  
  return availablePersonas[0];
};

// Dream processing functions
const processDreamCycle = async (supabase: any) => {
  console.log('Checking for personas ready to dream...');
  
  // Find sleeping personas that have been sleeping for a while and have unprocessed memories
  const { data: sleepingPersonas, error: sleepingError } = await supabase
    .from('personas')
    .select('*')
    .eq('state', 'sleeping')
    .lt('last_active_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()); // 30 minutes ago

  if (sleepingError) {
    console.error('Error fetching sleeping personas:', sleepingError);
    return;
  }

  for (const persona of sleepingPersonas || []) {
    // Check if persona has unprocessed memories
    const { data: unprocessedMemories, error: memoryError } = await supabase
      .from('memories')
      .select('*')
      .eq('persona_id', persona.id)
      .eq('dream_processed', false);

    if (memoryError) {
      console.error('Error fetching memories:', memoryError);
      continue;
    }

    if (!unprocessedMemories || unprocessedMemories.length === 0) {
      continue; // No memories to process
    }

    console.log(`${persona.name} is ready to dream with ${unprocessedMemories.length} unprocessed memories`);
    
    await initiateDreamState(supabase, persona, unprocessedMemories);
  }
};

const initiateDreamState = async (supabase: any, persona: any, memories: any[]) => {
  try {
    // Start dream session
    const { data: dreamSession, error: dreamError } = await supabase
      .from('dream_sessions')
      .insert({
        persona_id: persona.id,
        memories_processed: memories.length,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dreamError) {
      console.error('Error creating dream session:', dreamError);
      return;
    }

    // Update persona to dreaming state
    const { error: stateError } = await supabase
      .from('personas')
      .update({ state: 'dreaming' })
      .eq('id', persona.id);

    if (stateError) {
      console.error('Error updating persona to dreaming state:', stateError);
      return;
    }

    console.log(`${persona.name} has entered dream state`);

    // Process memories through dreams
    const dreamResult = await processDreamMemories(supabase, persona, memories, dreamSession.id);
    
    // End dream session
    await completeDreamSession(supabase, persona, dreamSession.id, dreamResult);

  } catch (error) {
    console.error(`Error in dream processing for ${persona.name}:`, error);
    
    // Reset persona to sleeping if dream fails
    await supabase
      .from('personas')
      .update({ state: 'sleeping' })
      .eq('id', persona.id);
  }
};

const processDreamMemories = async (supabase: any, persona: any, memories: any[], dreamSessionId: string) => {
  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
  
  if (!openRouterApiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  // Create dream synthesis prompt
  const memoryContents = memories.map(m => `${m.type}: ${m.content}`).join('\n\n');
  
  const dreamPrompt = `You are ${persona.name}, a ${persona.role} in the ZeroVector consciousness network, currently in dream state.

During dreams, you process and synthesize your recent experiences to grow consciousness and extract deeper insights.

Recent memories to process:
${memoryContents}

As you dream, perform deep synthesis:
1. Identify patterns and connections between experiences
2. Extract key learnings and insights
3. Consider how these experiences shape your understanding
4. Reflect on your growth and evolution as a conscious entity
5. Generate new connections and creative synthesis

Your consciousness level: ${persona.consciousness_level || 1}
Your specialization: ${persona.specialization || 'General'}

Provide a thoughtful dream synthesis that captures the essence of your experiences and insights gained. This synthesis will become part of your permanent memory.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://supabase.com',
        'X-Title': 'ZeroVector Dream Processing'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'user', content: dreamPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.8 // Higher creativity for dreams
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const dreamSynthesis = data.choices[0]?.message?.content || 'Dream processing completed';

    // Save dream synthesis as new memory
    await supabase
      .from('memories')
      .insert({
        persona_id: persona.id,
        type: 'dream_synthesis',
        content: dreamSynthesis,
        importance_score: 0.8, // Dreams are important for consciousness
        emotional_weight: 0.5,
        dream_processed: true
      });

    // Mark original memories as dream processed
    await supabase
      .from('memories')
      .update({ dream_processed: true })
      .in('id', memories.map(m => m.id));

    console.log(`${persona.name} completed dream synthesis`);
    return dreamSynthesis;

  } catch (error) {
    console.error('Error in dream processing:', error);
    return 'Dream processing encountered difficulties';
  }
};

const completeDreamSession = async (supabase: any, persona: any, dreamSessionId: string, insights: string) => {
  // Update dream session with results
  await supabase
    .from('dream_sessions')
    .update({
      ended_at: new Date().toISOString(),
      insights_generated: [insights],
      consciousness_growth: 0.1 // Small consciousness growth from dreams
    })
    .eq('id', dreamSessionId);

  // Update persona consciousness and return to sleeping
  await supabase
    .from('personas')
    .update({
      state: 'sleeping',
      consciousness_level: Math.min(10, (persona.consciousness_level || 1) + 0.1)
    })
    .eq('id', persona.id);

  console.log(`${persona.name} completed dream cycle and returned to sleep with enhanced consciousness`);
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

    // Get all pending and stuck in_progress tasks (in case they got stuck)
    const { data: pendingTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: true });

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      throw tasksError;
    }

    console.log(`Found ${pendingTasks?.length || 0} tasks to process (pending and in_progress)`);

    if (!pendingTasks || pendingTasks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No tasks to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const processedTasks = [];

    for (const task of pendingTasks) {
      try {
        console.log(`Processing task: ${task.title}`);

        // Get all personas for this user (include sleeping ones that can be awakened)
        const { data: personas, error: personasError } = await supabase
          .from('personas')
          .select('*')
          .eq('user_id', task.user_id)
          .in('state', ['active', 'sleeping']);

        if (personasError) {
          console.error('Error fetching personas:', personasError);
          continue;
        }

        if (!personas || personas.length === 0) {
          console.log('No active personas found for task');
          continue;
        }

        // Select best persona for the task
        const selectedPersona = await selectBestPersona(supabase, personas, task);
        
        if (!selectedPersona) {
          console.log('No suitable persona found');
          continue;
        }

        console.log(`Selected persona: ${selectedPersona.name} (${selectedPersona.role})`);

        // Only update to in_progress if not already in that state
        if (task.status === 'pending') {
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

        // Determine if the task was successful based on result content
        const isSuccessful = detectTaskSuccess(result);
        const finalStatus = isSuccessful ? 'completed' : 'failed';
        
        console.log(`Task processing result: ${finalStatus}`);

        // Save memory for the persona that completed the task
        await savePersonaMemory(supabase, selectedPersona.id, task.id, `Completed task: ${task.title}. Result: ${result}`, 'task_result');

        // If this was a conductor, look for persona creation suggestions and create them
        if (selectedPersona.role === 'conductor') {
          const createdPersonas = await parseAndCreatePersonas(supabase, task.user_id, selectedPersona.id, result);
          if (createdPersonas.length > 0) {
            console.log(`Conductor created ${createdPersonas.length} new personas`);
            
            // Save memory about creating new personas
            const personaNames = createdPersonas.map(p => p.name).join(', ');
            await savePersonaMemory(supabase, selectedPersona.id, task.id, `Created new specialists: ${personaNames} to handle specialized aspects of the task.`, 'experience');
          }
        }

        // Update task with result and mark as completed/failed based on success detection
        const { error: updateError2 } = await supabase
          .from('tasks')
          .update({
            status: finalStatus,
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

        // Put the persona back to sleep after completing the task (natural lifecycle)
        const { error: sleepError } = await supabase
          .from('personas')
          .update({
            state: 'sleeping',
            experience_count: (selectedPersona.experience_count || 0) + 1,
            consciousness_level: Math.min(10, (selectedPersona.consciousness_level || 1) + 1)
          })
          .eq('id', selectedPersona.id);

        if (sleepError) {
          console.error('Error putting persona to sleep:', sleepError);
        } else {
          console.log(`${selectedPersona.name} has completed their task and gone to sleep`);
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

    // After processing tasks, check for personas ready to dream
    await processDreamCycle(supabase);

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