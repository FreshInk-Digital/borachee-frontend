// File: nodemailer/index.js
console.log("🔥 BORACHEE BEEM SMS SERVER RUNNING 🔥");

const path = require("path");

// Load .env if present (works locally; in cPanel you can also set env vars in UI)
require("dotenv").config();
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.set("trust proxy", 1);

// ---- CORS (frontend -> backend subdomain) ----
const DEFAULT_ALLOWED =
  "https://borachee.co.tz,https://www.borachee.co.tz,http://localhost:5173,http://localhost:3000";
const allowedOrigins = new Set(
  String(process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow server-to-server, curl, and same-origin (no Origin header)
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      return cb(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT || 3000);

const BEEM_URL = process.env.BEEM_API_URL || "https://apisms.beem.africa/v1/send";
const SMS_ENABLED = String(process.env.BEEM_SMS_ENABLED || "false")
  .trim()
  .toLowerCase() === "true";

const API_KEY = (process.env.BULK_SMS_BEEM_API_KEY || "").trim();
const SECRET = (process.env.BULK_SMS_BEEM_SECRET_KEY || "").trim();

const SENDER = String(process.env.BEEM_SENDER_NAME || "BORACHEE")
  .trim()
  .slice(0, 11)
  .toUpperCase();

function normalizeMsisdn(n) {
  let s = String(n || "").trim().replace(/[^\d]/g, "");
  if (s.startsWith("0") && s.length === 10) s = "255" + s.slice(1);
  if ((s.startsWith("7") || s.startsWith("6")) && s.length === 9) s = "255" + s;
  if (!(s.startsWith("255") && s.length === 12)) return "";
  return s;
}

function parseRecipients() {
  const raw = (process.env.BEEM_RECIPIENTS || "").trim();
  return raw
    .split(",")
    .map((x) => normalizeMsisdn(x))
    .filter(Boolean);
}

function mask(v) {
  if (!v) return null;
  return v.slice(0, 3) + "***" + v.slice(-3);
}

// --------------------
// ROUTER
// --------------------
const router = express.Router();

router.get(["/", "/healthz"], (req, res) => {
  res.json({ success: true, message: "Backend running" });
});

router.get("/health", (req, res) => {
  const recipients = parseRecipients();
  res.json({
    ok: true,
    smsEnabled: SMS_ENABLED,
    beemUrl: BEEM_URL,
    sender: SENDER,
    apiKeySet: !!API_KEY,
    secretKeySet: !!SECRET,
    recipientsCount: recipients.length,
    allowedOrigins: Array.from(allowedOrigins),
  });
});

// (Optional) keep debug but don’t expose secrets
router.get("/debug", (req, res) => {
  const recipients = parseRecipients();
  res.json({
    success: true,
    beemUrl: BEEM_URL,
    sender: SENDER,
    apiKeyMasked: mask(API_KEY),
    secretKeyMasked: mask(SECRET),
    recipientsCount: recipients.length,
    recipientsMasked: recipients.map(mask),
  });
});

router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body || {};

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "name, email, phone, and message are required",
      });
    }

    if (!SMS_ENABLED) {
      return res.status(503).json({
        success: false,
        message: "SMS is disabled on server (BEEM_SMS_ENABLED=false).",
      });
    }

    if (!API_KEY || !SECRET) {
      return res.status(500).json({
        success: false,
        message: "Missing BEEM credentials (BULK_SMS_BEEM_API_KEY / BULK_SMS_BEEM_SECRET_KEY).",
      });
    }

    if (API_KEY === SECRET) {
      return res.status(500).json({
        success: false,
        message: "Invalid BEEM credentials: API key and Secret key are identical.",
      });
    }

    const recipients = parseRecipients();
    if (!recipients.length) {
      return res.status(500).json({
        success: false,
        message: "No valid recipients in BEEM_RECIPIENTS.",
      });
    }

    const smsText =
      `New contact\n` +
      `Name: ${String(name).slice(0, 80)}\n` +
      `Phone: ${normalizeMsisdn(phone) || String(phone).slice(0, 30)}\n` +
      `Email: ${String(email).slice(0, 80)}\n` +
      `Msg: ${String(message).slice(0, 300)}`;

    const payload = {
      source_addr: SENDER,
      encoding: 0,
      schedule_time: "",
      message: smsText,
      recipients: recipients.map((num, i) => ({ recipient_id: i + 1, dest_addr: num })),
    };

    const authHeader = "Basic " + Buffer.from(`${API_KEY}:${SECRET}`).toString("base64");

    const beemRes = await axios.post(BEEM_URL, payload, {
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      timeout: 20000,
    });

    return res.json({
      success: true,
      message: "Message received & SMS sent",
      beem: beemRes.data,
    });
  } catch (err) {
    return res.status(502).json({
      success: false,
      message: "BEEM request failed",
      error: err.response?.data || err.message,
    });
  }
});

// Mount on both (keeps /api working)
app.use("/", router);
app.use("/api", router);

// Always JSON 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found", path: req.originalUrl });
});

// ---- cPanel Passenger compatibility ----
const isPassenger =
  !!process.env.PASSENGER_APP_ENV ||
  !!process.env.PASSENGER_BASE_URI ||
  !!process.env.PASSENGER_APP_ROOT;

if (!isPassenger) {
  app.listen(PORT, "0.0.0.0", () => console.log("Server running on port", PORT));
}

module.exports = app;
