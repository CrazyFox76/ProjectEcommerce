import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Test menggunakan Anon Key (Public)
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

describe('Supabase RLS Policies (Security Tests)', () => {
  
  it('✅ Public should be able to read products', async () => {
    const { data, error } = await anonClient
      .from('products')
      .select('*')
      .limit(1);
    
    expect(error).toBeNull();
  });

  it('✅ Public should NOT be able to insert a product', async () => {
    const { error } = await anonClient.from('products').insert({
      name: 'Hacked Product',
      description: 'Hack',
      price: 1000,
      stock: 10,
      category: 'LCD',
      image_url: 'test.png'
    });

    // Harus error karena RLS melarang akses insert tanpa login admin
    expect(error).not.toBeNull();
    expect(error?.code).toBe('42501'); // Postgres RLS Error Code
  });

  it('✅ Public should NOT be able to upload to products storage bucket', async () => {
    const dummyContent = 'test file content';
    
    const { error } = await anonClient.storage
      .from('products')
      .upload(`hacked-${Date.now()}.txt`, dummyContent);

    // Harus gagal mengupload ke bucket karena dilarang
    expect(error).not.toBeNull();
  });
  
  it('✅ Public should NOT be able to read orders', async () => {
    const { data, error } = await anonClient
      .from('orders')
      .select('*')
      .limit(1);

    // Jika belum login, policy USING (auth.uid() = user_id) akan mengembalikan 0 data
    // Bukan error, tapi datanya kosong untuk menjaga privasi
    expect(error).toBeNull();
    expect(data).toEqual([]); 
  });

  it('✅ Public should NOT be able to read users table', async () => {
    const { data, error } = await anonClient
      .from('users')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});
