const http = require('http');

const data = JSON.stringify({
  name: 'Website Contact Test',
  email: 'tester@example.com',
  phone: '0767876503',
  message: 'Automated test — please ignore',
  recipients: ['255767876503','255658199566','255745000529']
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('HTTP_STATUS:', res.statusCode);
    try { console.log(JSON.stringify(JSON.parse(body), null, 2)); } catch (e) { console.log(body); }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  process.exit(1);
});

req.write(data);
req.end();
