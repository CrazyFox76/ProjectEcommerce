const https = require('https');

const options = {
  hostname: 'vnehudqtmthapncvufos.supabase.co',
  port: 443,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZWh1ZHF0bXRoYXBuY3Z1Zm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NzIyNjQsImV4cCI6MjA4NjA0ODI2NH0.SJxY1s_98V3by4QCoT12lAvbjxpmW3aNsaG-EYJkU88'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data);
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
