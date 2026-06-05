import express from "express";
import { getSuperAdminStats } from "../controllers/superAdminController.js"; // Path adjust kar lein
import { protect, isSuperAdmin } from "../middleware/authMiddleware.js"; // Jo bhi aapke middleware ka naam hai

const router = express.Router();

router.get("/dashboard-stats", protect, isSuperAdmin, getSuperAdminStats);

export default router;