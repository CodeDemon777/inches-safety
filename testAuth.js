import http from 'http';

const sendReq = (path, body) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    const req = http.request(options, res => {
      let d = '';
      res.on('data', chunk => d+=chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(d || '{}') }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

const run = async () => {
  try {
    const reg = await sendReq('/api/auth/register', { email: 'inches.safety@gmail.com', password: 'dzcltojkoxqjzfce', full_name: 'Admin' });
    console.log('Register Res:', reg);
    
    const log = await sendReq('/api/auth/login', { email: 'inches.safety@gmail.com', password: 'dzcltojkoxqjzfce' });
    console.log('Login Res:', log);
  } catch(e) {
    console.error(e);
  }
};
run();
