// File: src/pages/Contact/Contact.jsx (adjust path to your project)
import React, { useMemo, useState } from "react";
import "./Contact.css";

import msg_icon from "../../assets/msg-icon.png";
import mail_icon from "../../assets/mail-ico.png";
import phone_icon from "../../assets/phone-ico.png";
import location_icon from "../../assets/location-ico.png";
import insta_icon from "../../assets/insta-ico.png";
import whatsapp_icon from "../../assets/whatsapp-ico.png";
import white_arrow from "../../assets/white-arrow.png";

export default function Contact() {
  const formInitialDetails = { name: "", email: "", phone: "", message: "" };

  const [formDetails, setFormDetails] = useState(formInitialDetails);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState({ success: null, message: "" });

  const API_BASE = useMemo(() => {
    // 1) Prefer env variables (Vite or CRA)
    const viteBase =
      (typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.VITE_API_BASE) ||
      "";
    const craBase =
      (typeof process !== "undefined" &&
        process.env &&
        process.env.REACT_APP_API_BASE) ||
      "";

    const envBase = String(viteBase || craBase || "").trim();
    if (envBase) return envBase.replace(/\/$/, "");

    // 2) Smart defaults (your exact domains)
    const host =
      typeof window !== "undefined" ? window.location.hostname : "";

    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".local");

    if (isLocal) return "http://localhost:3000/api";

    // If you are on borachee.co.tz, use backend subdomain by default
    if (host === "borachee.co.tz" || host === "www.borachee.co.tz") {
      return "https://server.borachee.co.tz/api";
    }

    // 3) Fallback: same-origin /api (in case you later proxy)
    return `${window.location.origin}/api`;
  }, []);

  const onFormUpdate = (category, value) => {
    setFormDetails((prev) => ({ ...prev, [category]: value }));
  };

  async function readResponseSafely(res) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return await res.json();
    const text = await res.text();
    return { _nonJson: true, text };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setStatus({ success: null, message: "" });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=utf-8" },
        body: JSON.stringify(formDetails),
        signal: controller.signal,
      });

      const data = await readResponseSafely(res);

      if (data?._nonJson) {
        setStatus({
          success: false,
          message:
            "Server returned non-JSON (usually backend down / wrong URL). Check server.borachee.co.tz API.",
        });
        return;
      }

      if (!res.ok) {
        setStatus({
          success: false,
          message: data?.message || `Request failed (${res.status})`,
        });
        return;
      }

      if (data?.success === true) {
        setStatus({
          success: true,
          message: data?.message || "Message sent successfully",
        });
        setFormDetails(formInitialDetails);
      } else {
        setStatus({
          success: false,
          message: data?.message || "Failed to send. Try again.",
        });
      }
    } catch (err) {
      setStatus({
        success: false,
        message:
          err?.name === "AbortError"
            ? "Request timed out. Please try again."
            : "Could not reach the server. Please try again later.",
      });
    } finally {
      clearTimeout(timeoutId);
      setIsSending(false);
    }
  };

  return (
    <div className="contact">
      <div className="contact-col">
        <h3>
          Send us a message <img src={msg_icon} alt="" />
        </h3>

        <p>
          Feel free to reach out through contact form or find our contact information
          below. Your feedback, questions, and suggestions are important to us as we
          strive to provide exceptional service to our customers.
        </p>

        <ul>
          
          <li>
            <img src={phone_icon} alt="" /> +255 767 876 503
          </li>

          <li>
            <a
              href="https://www.instagram.com/borachee_tz/"
              target="_blank"
              rel="noreferrer"
            >
              <img src={insta_icon} alt="" /> @borachee_tz
            </a>
          </li>

          <li>
            <img src={location_icon} alt="" />
            Dar Office: Plot 68, Bagamoyo Road, Mbezi Beach Tangibovu,
            <br />
            Dar es Salaam, Tanzania
          </li>

          <li>
            <img src={location_icon} alt="" />
           Mbeya Office: Tunduma Road, Ilomba,
            <br />
            Mbeya, Tanzania
          </li>
        </ul>
      </div>

      <div className="contact-col">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={formDetails.name}
            placeholder="Enter Your Full Name"
            onChange={(e) => onFormUpdate("name", e.target.value)}
            required
          />
          <input
            type="email"
            value={formDetails.email}
            placeholder="Enter Your Email Address"
            onChange={(e) => onFormUpdate("email", e.target.value)}
            required
          />
          <input
            type="tel"
            value={formDetails.phone}
            placeholder="Enter Your Phone Number"
            onChange={(e) => onFormUpdate("phone", e.target.value)}
            required
          />
          <textarea
            rows="6"
            value={formDetails.message}
            placeholder="Enter Your Message"
            onChange={(e) => onFormUpdate("message", e.target.value)}
            required
          />

          <button type="submit" className="btn dark-btn" disabled={isSending}>
            {isSending ? "Sending..." : "Send Now"} <img src={white_arrow} alt="" />
          </button>

          {status.message ? (
            <div className="row">
              <p className={status.success ? "success" : "danger"}>
                {status.message}
              </p>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
