import express from "express";
// ─── CONTROLLERS IMPORT ──────────────────────────────────────────────────
import { 
  getSuperAdminStats, 
  createSchoolAdmin, 
  registerSchool,
  getAllSchools
} from "../controllers/superAdminController.js"; 

// ─── MIDDLEWARES IMPORT ──────────────────────────────────────────────────
// protect: Token verification aur user payload validation ke liye
// isSuperAdmin: Gatekeeper middleware jo sirf 'superadmin' role ko allow karega
import { protect, isSuperAdmin } from "../middleware/authMiddleware.js"; 

const router = express.Router();

/**
 * @route   GET /api/v1/superadmin/dashboard-stats
 * @desc    Get global analytics, system metrics, and summary data for the SuperAdmin KPI blocks.
 * @access  Private (SuperAdmin Only)
 */
router.get("/dashboard-stats", protect, isSuperAdmin, getSuperAdminStats);

/**
 * @route   POST /api/v1/superadmin/add-school
 * @desc    Register a new institutional client (school branch) into the SaaS ecosystem.
 * @access  Private (SuperAdmin Only)
 */
router.post("/add-school", protect, isSuperAdmin, registerSchool);

// ─── NEW FETCH ROUTE ─────────────────────────────────────────────────────
/**
 * @route   GET /api/v1/superadmin/all-schools
 * @desc    Fetch all registered schools for management table view.
 * @access  Private (SuperAdmin Only)
 */
router.get("/all-schools", protect, isSuperAdmin, getAllSchools);
/**
 * @route   POST /api/v1/superadmin/create-admin
 * @desc    Provision a localized School Admin (Branch Principal/Owner) account mapped to a target school.
 * @access  Private (SuperAdmin Only)
 */
router.post("/create-admin", protect, isSuperAdmin, createSchoolAdmin);

export default router;