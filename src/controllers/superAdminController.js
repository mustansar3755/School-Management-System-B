import UserModel from "../model/UserModel.js";
import SchoolModel from "../model/SchoolModel.js";
import { AdminModel } from "../model/AdminModel.js";
import { StudentModel } from "../model/StudentModel.js";

// ─── GET SUPERADMIN DASHBOARD STATS ──────────────────────────────────────────
export const getSuperAdminStats = async (req, res) => {
  try {
    // Performance Optimization: Saare counts parallel mein chalenge
    const [
      totalSchools,
      totalAdmins,
      activeStudents,
      pendingRequests,
      recentSchools
    ] = await Promise.all([
      
      // 1. Total Schools ka count
      SchoolModel.countDocuments(),

      // 2. Total Admins ka count (Sirf unka jinka role admin hai, superadmin nahi)
      UserModel.countDocuments({ role: "admin" }),

      // 3. Active Students ka count (Pehle UserModel mein check hoga status active hai ya nahi)
      UserModel.countDocuments({ role: "student", status: "active" }),

      // 4. Pending Requests (Misaal ke tor par jo schools approval ka wait kar rahe hain)
      SchoolModel.countDocuments({ status: "inactive" }), // Aap apne logic ke mutabiq condition change kar sakte hain

      // 5. Recent Schools (Aakhir mein register hone wale top 5 schools)
      SchoolModel.find()
        .sort({ createdAt: -1 }) // Latest first
        .limit(5)
        .select("name status createdAt") // Sirf zaroori fields nikalna taake query heavy na ho
    ]);

    // Response send karein jo frontend ki slice se exact match karta hai
    res.status(200).json({
      totalSchools,
      totalAdmins,
      activeStudents,
      pendingRequests,
      recentSchools,
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Failed to fetch dashboard statistics", 
      error: error.message 
    });
  }
};