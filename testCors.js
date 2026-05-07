const run = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8080'
      },
      body: JSON.stringify({ email: 'inches.safety@gmail.com', password: 'dzcltojkoxqjzfce' })
    });
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Body: ${text}`);
    
    // Check preflight
    const optRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:8080',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log(`Preflight Status: ${optRes.status}`);
    console.log(`Preflight Headers: `, [...optRes.headers.entries()]);
  } catch(e) {
    console.error(e);
  }
};
run();
