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
console.log('BEEM_SENDER_NAME =', process.env.BEEM_SENDER_NAME || 'KANISANI');

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
  // Use the BEEM_SENDER_NAME env var when available. Default to 'KANISANI' while
  // the 'BORACHEE' brand is under review. Trim and limit to 11 chars (recommended
  // max for SMS sender names).
  const rawSender = process.env.BEEM_SENDER_NAME || 'KANISANI';
  const sender = String(rawSender).trim().slice(0, 11).toUpperCase();

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
          // log detailed error for debugging (but do not print secrets)
          console.error(`Failed to send SMS to ${maskNumber(recipient)} (form fallback):`, {
            status: err2.response?.status,
            data: err2.response?.data,
            message: err2.message,
          });

          // Try Bearer token fallback (some BEEM setups expect bearer tokens)
          try {
            const bearerHeaders = { 'Content-Type': 'application/json' };
            if (secretKey) bearerHeaders['Authorization'] = `Bearer ${secretKey}`;
            const response3 = await axios.post(beemUrl, payload, { headers: bearerHeaders, timeout: 15000 });
            console.log(`SMS sent (bearer json) to ${maskNumber(recipient)}`);
            results.push({ to: recipient, success: true, response: response3.data });
          } catch (err3) {
            try {
              const params3 = new URLSearchParams();
              params3.append('api_key', apiKey || '');
              params3.append('secret_key', secretKey || '');
              params3.append('sender', sender || '');
              params3.append('to', recipient);
              params3.append('message', smsText);

              const bearerFormHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
              if (secretKey) bearerFormHeaders['Authorization'] = `Bearer ${secretKey}`;

              const response4 = await axios.post(beemUrl, params3.toString(), { headers: bearerFormHeaders, timeout: 15000 });
              console.log(`SMS sent (bearer form) to ${maskNumber(recipient)}`);
              results.push({ to: recipient, success: true, response: response4.data });
            } catch (err4) {
              console.error(`All attempts failed for ${maskNumber(recipient)}:`, {
                primary: err.message || err,
                formFallback: err2.response?.data || err2.message,
                bearerFallbackStatus: err4.response?.status,
                bearerFallbackData: err4.response?.data,
              });
              results.push({ to: recipient, success: false, error: err4.response?.data || err4.message || err2.response?.data || err2.message });
            }
          }
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
