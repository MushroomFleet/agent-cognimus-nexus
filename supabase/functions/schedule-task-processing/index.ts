import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Checking for pending tasks...');

    // Check if there are any pending tasks
    const { data: pendingTasks, error } = await supabase
      .from('tasks')
      .select('id, user_id, created_at')
      .eq('status', 'pending')
      .limit(10);

    if (error) {
      console.error('Error checking pending tasks:', error);
      throw error;
    }

    if (!pendingTasks || pendingTasks.length === 0) {
      console.log('No pending tasks found');
      return new Response(
        JSON.stringify({ message: 'No pending tasks to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${pendingTasks.length} pending tasks, triggering processing...`);

    // Call the process-tasks function
    const { data: processResult, error: processError } = await supabase.functions.invoke('process-tasks');

    if (processError) {
      console.error('Error calling process-tasks:', processError);
      throw processError;
    }

    console.log('Task processing completed:', processResult);

    return new Response(
      JSON.stringify({
        message: 'Task processing triggered successfully',
        pendingTasksFound: pendingTasks.length,
        processResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in schedule-task-processing:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});