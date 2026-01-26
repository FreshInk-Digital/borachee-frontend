// File: nodemailler/index.js
/**
 * BEEM SMS forwarder (correct payload + auth)
 * - POST /  accepts { name, email, phone, message }
 * - Sends SMS via BEEM to configured recipients (BEEM_RECIPIENTS)
 * - Returns 200 only when BEEM accepts the request
 * - Returns 502 if BEEM rejects (e.g., 401 auth / insufficient credits / invalid sender)
 */

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors({ origin: true, methods: ["GET", "POST", "OPTIONS"] }));
app.use(express.json());

const PORT = Number(process.env.PORT || 4000);

const BEEM_URL = process.env.BEEM_API_URL || "https://apisms.beem.africa/v1/send";
const SMS_ENABLED =
  String(process.env.BEEM_SMS_ENABLED || "false").trim().toLowerCase() === "true";

function maskNumber(num) {
  if (!num) return "***";
  const s = String(num).replace(/\D+/g, "");
  if (s.length <= 3) return "***";
  return "*".repeat(s.length - 3) + s.slice(-3);
}

function normalizeMsisdn(input) {
  // keep digits only; BEEM expects format like 2557xxxxxxxx (no +)
  return String(input || "").replace(/\D+/g, "");
}

function parseRecipientsFromEnv() {
  return (process.env.BEEM_RECIPIENTS || "")
    .split(",")
    .map((n) => normalizeMsisdn(n.trim()))
    .filter(Boolean);
}

function buildBeemPayload({ sourceAddr, message, recipients }) {
  // BEEM expects recipients array of { recipient_id, dest_addr }
  return {
    source_addr: sourceAddr,   // Sender ID
    encoding: 0,
    schedule_time: "",
    message,
    recipients: recipients.map((dest, idx) => ({
      recipient_id: idx + 1,
      dest_addr: dest,
    })),
  };
}

app.get("/", (req, res) => res.json({ status: "BEEM SMS service running" }));

app.get("/health", (req, res) => {
  const recipients = parseRecipientsFromEnv();
  res.json({
    ok: true,
    smsEnabled: SMS_ENABLED,
    beemUrl: BEEM_URL,
    sender: (process.env.BEEM_SENDER_NAME || "").trim(),
    recipientsCount: recipients.length,
    recipientsMasked: recipients.map(maskNumber),
    hasApiKey: !!process.env.BULK_SMS_BEEM_API_KEY,
    hasSecretKey: !!process.env.BULK_SMS_BEEM_SECRET_KEY,
  });
});

app.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body || {};

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: "name, email, phone, and message are required",
      });
    }

    if (!SMS_ENABLED) {
      return res.status(503).json({
        success: false,
        code: 503,
        message: "SMS is disabled on server (BEEM_SMS_ENABLED=false).",
      });
    }

    const apiKey = (process.env.BULK_SMS_BEEM_API_KEY || "").trim();
    const secretKey = (process.env.BULK_SMS_BEEM_SECRET_KEY || "").trim();

    if (!apiKey || !secretKey) {
      return res.status(500).json({
        success: false,
        code: 500,
        message: "BEEM API credentials not set (BULK_SMS_BEEM_API_KEY / BULK_SMS_BEEM_SECRET_KEY).",
      });
    }

    // Helpful sanity check (many people accidentally paste same value twice)
    if (apiKey === secretKey) {
      return res.status(500).json({
        success: false,
        code: 500,
        message:
          "BEEM credentials look invalid: API key and Secret key are identical. Please copy the correct SMS API credentials from your BEEM account.",
      });
    }

    const sender = String(process.env.BEEM_SENDER_NAME || "INFO")
      .trim()
      .slice(0, 11)
      .toUpperCase();

    const recipients = parseRecipientsFromEnv();
    if (!recipients.length) {
      return res.status(500).json({
        success: false,
        code: 500,
        message: "No recipients configured (BEEM_RECIPIENTS is empty).",
      });
    }

    const smsText =
      `New contact\n` +
      `Name: ${name}\n` +
      `Phone: ${normalizeMsisdn(phone) || phone}\n` +
      `Email: ${email}\n` +
      `Msg: ${String(message).slice(0, 300)}`;

    // BEEM expects Basic Auth: base64(api_key:secret_key) :contentReference[oaicite:2]{index=2}
    const authHeader = `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString("base64")}`;

    // BEEM expects payload: source_addr, encoding, schedule_time, message, recipients[] :contentReference[oaicite:3]{index=3}
    const payload = buildBeemPayload({
      sourceAddr: sender,
      message: smsText,
      recipients,
    });

    try {
      const beemRes = await axios.post(BEEM_URL, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        timeout: 20000,
      });

      // If BEEM accepted the request, return success
      return res.status(200).json({
        success: true,
        code: 200,
        message: "SMS sent successfully",
        providerResponse: beemRes.data,
      });
    } catch (err) {
      const status = err.response?.status || 500;
      const data = err.response?.data;
      const providerMsg =
        (typeof data === "object" && (data.message || data.error)) ||
        (typeof data === "string" ? data : "") ||
        err.message;

      // Surface a clean message to frontend, keep details for debugging
      return res.status(502).json({
        success: false,
        code: 502,
        message:
          status === 401
            ? "BEEM rejected authentication (401). Verify you are using the correct SMS API Key + Secret Key from your BEEM account."
            : `BEEM request failed (${status}). ${providerMsg}`,
        providerStatus: status,
        providerData: data,
      });
    }
  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({ success: false, code: 500, message: "Server error" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`BEEM SMS server running on port ${PORT}`);
});
