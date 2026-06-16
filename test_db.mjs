const supabaseUrl = 'https://vnehudqtmthapncvufos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZWh1ZHF0bXRoYXBuY3Z1Zm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NzIyNjQsImV4cCI6MjA4NjA0ODI2NH0.SJxY1s_98V3by4QCoT12lAvbjxpmW3aNsaG-EYJkU88';

async function run() {
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  };

  // 1. Get a random user from public.users
  const res1 = await fetch(`${supabaseUrl}/rest/v1/users?select=*&limit=1`, { headers });
  const users = await res1.json();
  console.log("Users:", users);

  if (users.length > 0) {
    const userId = users[0].id;
    console.log("Attempting to insert order for userId:", userId);

    // 2. Try to insert an order for this user
    const orderNumber = `TRX-${Date.now()}`;
    const res2 = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        user_id: userId,
        order_number: orderNumber,
        total_price: 100000,
        status: "pending",
        shipping_address: "Test Address",
        payment_method: "Midtrans"
      })
    });
    
    console.log("Order Insert Status:", res2.status);
    const orderRes = await res2.json();
    console.log("Order Insert Res:", orderRes);
  } else {
    console.log("No users found.");
  }
}

run();
