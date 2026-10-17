require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const rateLimit = require("express-rate-limit");

const app = express();
app.set("trust proxy", 1);
const caPath = path.join(__dirname, "ca.pem");
const caCertificate = fs.readFileSync(caPath, "utf8");

console.log("CA file loaded:", caPath);
console.log("CA certificate length:", caCertificate.length);
console.log("CA certificate header:", caCertificate.split(/\r?\n/)[0]);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 15000,
  ssl: {
    ca: caCertificate,
    rejectUnauthorized: true
  }
});


const allowedOrigins = new Set([
  "https://suvexavusm.com",
  "https://www.suvexavusm.com",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      console.error("CORS rejected origin:", origin);
      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json({ limit: "20kb" }));

app.use("/api/contact", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
}));


app.get("/health", (req, res) => {
  res.json({ status: "ok", app: "Suvexa VUSM" });
});

app.post("/api/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body || {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    name.trim().length > 100 ||
    email.trim().length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    !message.trim() ||
    message.trim().length > 5000 ||
    (phone != null &&
      (typeof phone !== "string" || phone.length > 30)) ||
    (subject != null &&
      (typeof subject !== "string" || subject.length > 200))
  ) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid name, email and message.",
    });
  }

  let enquiryId;

  // 1. Save the enquiry to MySQL first.
  try {
    const [result] = await pool.execute(
      `INSERT INTO contact_enquiries
       (name, email, phone, subject, message)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.trim(),
        phone?.trim() || null,
        subject?.trim() || null,
        message.trim(),
      ]
    );

    enquiryId = result.insertId;
  } catch (error) {
    console.error("MySQL save failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "We couldn't save your enquiry. Please try again later.",
    });
  }

  // 2. Respond immediately after MySQL confirms the save.
  res.status(201).json({
    success: true,
    message: "Thank you! Your message has been submitted.",
    enquiryId,
  });

  setImmediate(async () => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Suvexa VUSM Website <notifications@notify.suvexavusm.com>",
      to: [process.env.CONTACT_TO || "info@suvexavusm.com"],
      replyTo: email.trim(),
      subject: `Website enquiry #${enquiryId}`,

      text: [
        `Enquiry ID: ${enquiryId}`,
        `Name: ${name.trim()}`,
        `Email: ${email.trim()}`,
        `Phone: ${phone?.trim() || "Not provided"}`,
        `Subject: ${subject?.trim() || "Not provided"}`,
        "",
        "Message:",
        message.trim(),
      ].join("\n"),
    });

    if (error) {
      console.error(
        `Resend email failed for enquiry ${enquiryId}:`,
        error.message
      );
      return;
    }

    console.log(
      `Resend email accepted for enquiry ${enquiryId}:`,
      data?.id
    );
  } catch (error) {
    console.error(
      `Resend email failed for enquiry ${enquiryId}:`,
      error.message
    );
  }
});
});


const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("SELECT 1");

    app.listen(port, () => {
      console.log("MySQL connected successfully.");
      console.log(`Suvexa VUSM API running on port ${port}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);  
    console.error("Startup failed:", error);
    console.error("Error details:", error?.message);
    console.error("Stack trace:", error?.stack);
    process.exit(1);
  }
}

startServer();