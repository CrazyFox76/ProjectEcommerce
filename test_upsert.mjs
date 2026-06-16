import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vnehudqtmthapncvufos.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZWh1ZHF0bXRoYXBuY3Z1Zm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NzIyNjQsImV4cCI6MjA4NjA0ODI2NH0.SJxY1s_98V3by4QCoT12lAvbjxpmW3aNsaG-EYJkU88'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('users').upsert({
    id: "00000000-0000-0000-0000-000000000000",
    name: "Test",
    email: "test@example.com",
    role: "user"
  });
  console.log('Upsert Data:', data)
  console.log('Upsert Error:', JSON.stringify(error, null, 2))
}

test()
