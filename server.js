import dotenv from "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/DB.js";
import authRoutes from "./src/routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // JSON body parsing middleware
// --- CORS Middleware ---
app.use(cors());

app.use("/api/auth", authRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on PORT no:", PORT);
  });
});
