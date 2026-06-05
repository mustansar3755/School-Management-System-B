import dotenv from "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/DB.js";
import authRoutes from "./src/routes/authRoutes.js";
import superAdminRoutes from "./src/routes/superAdminRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // JSON body parsing middleware
// --- CORS Middleware ---
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/superadmin", superAdminRoutes); // Uncomment karein jab tak super admin routes available na ho

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on PORT no:", PORT);
  });
});
