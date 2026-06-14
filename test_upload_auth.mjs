import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vnehudqtmthapncvufos.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZWh1ZHF0bXRoYXBuY3Z1Zm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NzIyNjQsImV4cCI6MjA4NjA0ODI2NH0.SJxY1s_98V3by4QCoT12lAvbjxpmW3aNsaG-EYJkU88';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log('Logging in as tes@gmail.com...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'tes@gmail.com',
    password: '123456',
  });

  if (authError) {
    console.error('Login failed:', authError.message);
    return;
  }
  
  console.log('Logged in successfully!');

  console.log('Attempting to upload to product_images bucket...');
  const { data, error } = await supabase.storage
    .from('product_images')
    .upload(`test-${Date.now()}.txt`, 'Hello World');
  
  if (error) {
    console.error('FULL UPLOAD ERROR:');
    console.dir(error, { depth: null });
  } else {
    console.log('Upload successful!', data);
    
    // Also test getPublicUrl
    const urlData = supabase.storage.from('product_images').getPublicUrl(data.path);
    console.log('Public URL:', urlData.data.publicUrl);
  }
}

runTest();
