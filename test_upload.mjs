import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vnehudqtmthapncvufos.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZWh1ZHF0bXRoYXBuY3Z1Zm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NzIyNjQsImV4cCI6MjA4NjA0ODI2NH0.SJxY1s_98V3by4QCoT12lAvbjxpmW3aNsaG-EYJkU88';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  console.log('Testing list buckets...');
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('List Buckets Error:', listError);
  } else {
    console.log('Buckets:', buckets?.map(b => b.name));
  }

  console.log('Attempting to upload to product_images bucket...');
  const { error } = await supabase.storage
    .from('product_images')
    .upload(`test-${Date.now()}.txt`, 'hello');
  
  if (error) {
    console.error('Upload Error:', error);
  } else {
    console.log('Upload successful!');
  }
}

testStorage();
