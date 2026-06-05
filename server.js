import "dotenv/config"; // Direct import configuration line standard scale par
import express from "express";
import cors from "cors";
import connectDB from "./src/config/DB.js";

// ─── ROUTES IMPORTS ──────────────────────────────────────────────────────
import authRoutes from "./src/routes/authRoutes.js";
import superAdminRoutes from "./src/routes/superAdminRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORE MIDDLEWARES ────────────────────────────────────────────────────
// 1. Cross-Origin Resource Sharing (CORS) Security Configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Apne frontend port ke mutabiq match karein
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// 2. Request Body Parsers
app.use(express.json()); // JSON data parse karne ke liye
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Complex form data handles ke liye

// ─── API ROUTE PIPELINES ─────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/superadmin", superAdminRoutes);

// Base Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server status is healthy." });
});

// ─── GLOBAL ERROR HANDLING MIDDLEWARE ────────────────────────────────────
// Pure system mein koi bhi controller crash ho, yeh middleware catch karega
app.use((err, req, res, next) => {
  console.error("🚨 Global Server Error Logging:", err.stack);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error trapped at root pipeline.",
  });
});

// ─── DATABASE CONNECTION & SERVER LIFECYCLE ──────────────────────────────
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Multi-Tenant SaaS Engine running on PORT: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database Initialization Failed:", err.message);
    process.exit(1); // Server process terminate kar dega agar DB connect na ho سکے
  });