# nodemailler (BEEM SMS forwarder)

This service accepts POST requests from the front-end contact form and forwards the message to configured phone numbers via the BEEM SMS API.

Setup
1. Copy `.env.example` to `.env` and fill the values (BEEM_API_URL, keys, recipients).

2. Install dependencies:
   ```bash
   cd nodemailler
   npm install
   ```

3. Run in dev mode (auto-restart on changes):
   ```bash
   npm run dev
   ```

API
- GET /  -> health/status
- POST / -> accepts JSON { name, email, phone, message }. Optionally include `recipients` array to override env recipients for that request.

Example test (safe, single-recipient override):

```bash
curl -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@e.com","phone":"0756215388","message":"Hello","recipients":["0756215388"]}'
```

Notes
- Keep `.env` out of git.
- The server supports both JSON and form-urlencoded requests to the BEEM API (tries JSON first, then form fallback) and sends messages one recipient at a time to provide per-number results.
