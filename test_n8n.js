async function testWebhook() {
  const N8N_RESERVA_URL = 'https://n8n.serverbytokio.duckdns.org/webhook/reserva-bytokio';
  console.log('Testing n8n webhook with native fetch...');
  const payload = {
    booking_id: 'TEST-' + Date.now(),
    user: { id: 'test-user-id', email: 'test@example.com', full_name: 'Test Native', phone: '+5491122334455' },
    booking: { date: '2026-05-10', time: '10:00', timestamp: new Date().toISOString(), status: 'pending' }
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(N8N_RESERVA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Body:', text);
  } catch (err) {
    console.error('Fetch error:', err.name === 'AbortError' ? 'Timeout' : err.message);
  }
}

testWebhook();
