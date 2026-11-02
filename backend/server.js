require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
  "http://localhost:5173",
  "http://127.0.0.1:5173",
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
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
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
// ADMIN LOGIN RATE LIMIT
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

// VERIFY ADMIN TOKEN
function verifyAdminToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired login session.",
    });
  }
}

// ADMIN LOGIN
app.post("/api/admin/login", adminLoginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASSWORD_HASH ||
      !process.env.JWT_SECRET
    ) {
      console.error("Admin authentication environment is incomplete.");

      return res.status(500).json({
        success: false,
        message: "Admin login is not configured.",
      });
    }

    const emailMatches =
      email.trim().toLowerCase() ===
      process.env.ADMIN_EMAIL.trim().toLowerCase();

    const passwordMatches = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (!emailMatches || !passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process login.",
    });
  }
});

// GET ENQUIRIES — ADMIN ONLY
app.get("/api/admin/enquiries", verifyAdminToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, name, email, phone, subject, message, status, created_at
       FROM contact_enquiries
       ORDER BY created_at DESC`
    );

    return res.json({
      success: true,
      enquiries: rows,
    });
  } catch (error) {
    console.error("Admin enquiries error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load enquiries.",
    });
  }
});

// UPDATE ENQUIRY STATUS — ADMIN ONLY
app.patch(
  "/api/admin/enquiries/:id/status",
  verifyAdminToken,
  async (req, res) => {
    const enquiryId = Number(req.params.id);
    const { status } = req.body || {};

    const allowedStatuses = [
      "NEW",
      "CONTACTED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!Number.isSafeInteger(enquiryId) || enquiryId < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry ID.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry status.",
      });
    }

    try {
      const [result] = await pool.execute(
        "UPDATE contact_enquiries SET status = ? WHERE id = ?",
        [status, enquiryId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Enquiry not found.",
        });
      }

      return res.json({
        success: true,
        message: "Enquiry status updated.",
      });
    } catch (error) {
      console.error("Enquiry status update error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to update enquiry status.",
      });
    }
  }
);

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
      to: (
  process.env.CONTACT_TO || "info@suvexavusm.com"
)
  .split(",")
  .map((address) => address.trim())
  .filter(Boolean),
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