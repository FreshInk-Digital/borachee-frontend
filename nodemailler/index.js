/**
 * Simple BEEM SMS forwarder
 * - Reads config from .env
 * - POST / accepts { name, email, phone, message, recipients? }
 * - Sends one SMS per recipient and returns per-recipient results
 */
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

function maskNumber(num) {
  if (!num) return '';
  const s = String(num).replace(/\s+/g, '');
  if (s.length <= 3) return '***';
  return '*'.repeat(Math.max(0, s.length - 3)) + s.slice(-3);
}

/* -------------------- health check -------------------- */
app.get('/', (req, res) => {
  res.json({ status: 'BEEM SMS service running' });
});

/* -------------------- startup logs -------------------- */
console.log('Starting BEEM SMS server');
console.log('BEEM_SMS_ENABLED =', process.env.BEEM_SMS_ENABLED || 'false');
console.log('BEEM_API_URL set =', !!process.env.BEEM_API_URL);

const startupRecipients = (process.env.BEEM_RECIPIENTS || '')
  .split(',')
  .map((n) => n.trim())
  .filter(Boolean);

console.log('Configured recipients (count):', startupRecipients.length, startupRecipients.map(maskNumber));

/* -------------------- main endpoint -------------------- */
app.post('/', async (req, res) => {
  try {
    const { name, email, phone, message, recipients } = req.body || {};

    if (!name && !email && !phone && !message) {
      return res.status(400).json({ success: false, message: 'At least one field is required' });
    }

    if (String(process.env.BEEM_SMS_ENABLED).toLowerCase() !== 'true') {
      return res.json({ success: true, message: 'SMS disabled (BEEM_SMS_ENABLED=false)' });
    }

    const beemUrl = process.env.BEEM_API_URL;
    if (!beemUrl) return res.status(500).json({ success: false, message: 'BEEM_API_URL not set' });

    const apiKey = process.env.BULK_SMS_BEEM_API_KEY;
    const secretKey = process.env.BULK_SMS_BEEM_SECRET_KEY;
    const sender = process.env.BEEM_SENDER_NAME || 'BORACHEE';

    const recipientsList = Array.isArray(recipients) && recipients.length ? recipients : startupRecipients;
    if (recipientsList.length === 0) return res.status(500).json({ success: false, message: 'No recipients configured' });

    const smsText = `New contact from ${name || 'N/A'} (${phone || 'N/A'}). Msg: ${(message || '').slice(0, 120)}`;

    const results = [];

    // prepare Authorization header if api/secret present (Basic auth)
    const authHeader = apiKey && secretKey ? `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString('base64')}` : null;

    for (const recipient of recipientsList) {
      const payload = {
        api_key: apiKey,
        secret_key: secretKey,
        sender: sender,
        to: recipient,
        message: smsText,
      };

      const jsonHeaders = { 'Content-Type': 'application/json' };
      if (authHeader) jsonHeaders['Authorization'] = authHeader;

      try {
        const response = await axios.post(beemUrl, payload, { headers: jsonHeaders, timeout: 15000 });
        console.log(`SMS sent to ${maskNumber(recipient)}`);
        results.push({ to: recipient, success: true, response: response.data });
      } catch (err) {
        console.warn(`Primary JSON send failed for ${maskNumber(recipient)}:`, err.message || err);
        // try form-urlencoded fallback
        try {
          const params = new URLSearchParams();
          params.append('api_key', apiKey || '');
          params.append('secret_key', secretKey || '');
          params.append('sender', sender || '');
          params.append('to', recipient);
          params.append('message', smsText);

          const formHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
          if (authHeader) formHeaders['Authorization'] = authHeader;

          const response2 = await axios.post(beemUrl, params.toString(), { headers: formHeaders, timeout: 15000 });
          console.log(`SMS sent (form) to ${maskNumber(recipient)}`);
          results.push({ to: recipient, success: true, response: response2.data });
        } catch (err2) {
          console.error(`Failed to send SMS to ${maskNumber(recipient)}:`, err2.response?.data || err2.message);
          results.push({ to: recipient, success: false, error: err2.response?.data || err2.message });
        }
      }
    }

    return res.json({ success: true, message: 'SMS processed for recipients', results });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`BEEM SMS server running on port ${PORT}`);
});
