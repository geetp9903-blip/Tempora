const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://rpaioednlzduuuhmwwcn.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwYWlvZWRubHpkdXV1aG13d2NuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQyOTcxMSwiZXhwIjoyMDk3MDA1NzExfQ.K3ndZNa04gJGp2BaCbvEcR3Uz48_afueXX7YeaCYXTA';
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
  if (userErr) { console.error('userErr', userErr); return; }
  const user = users.users.find(u => u.email === 'geetpurohit090903@gmail.com');
  if (!user) { console.error('User not found'); return; }
  console.log('User found:', user.id);
  
  const { data: tasks, error: tasksErr } = await supabase.from('tasks').select('*').eq('user_id', user.id).ilike('title', '%Coursera%');
  console.log('Tasks matching Coursera:', tasks);
  
  const { data: events, error: eventsErr } = await supabase.from('calendar_events').select('*').eq('user_id', user.id).ilike('title', '%Coursera%');
  console.log('Events matching Coursera:', events);
}
run();
