import UserModel from "../model/UserModel.js";
import SchoolModel from "../model/SchoolModel.js";
import { AdminModel } from "../model/AdminModel.js";
import { StudentModel } from "../model/StudentModel.js";
import bcrypt from "bcryptjs";
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


// @desc    Register a new school client
// @route   POST /api/v1/superadmin/schools
// @access  Private/SuperAdmin
export const registerSchool = async (req, res) => {
  try {
    const { name, address, code, owner, subscription } = req.body;

    // 1. Mandatory Fields Validation
    if (!name || !address || !code) {
      return res.status(400).json({
        success: false,
        message: "School name, unique code, and address are required.",
      });
    }

    // 2. Uniform Case Formatting (Unique Identity Safety)
    const formattedCode = code.trim().toUpperCase();

    // 3. Duplicate School Code Check
    const existingSchool = await SchoolModel.findOne({ code: formattedCode });
    if (existingSchool) {
      return res.status(409).json({
        success: false,
        message: `A school with code '${formattedCode}' is already registered.`,
      });
    }

    // 4. Document Instantiation & Save
    const newSchool = new SchoolModel({
      name: name.trim(),
      address: address.trim(),
      code: formattedCode,
      owner: {
        name: owner?.name || "",
        phone: owner?.phone || "",
        email: owner?.email?.toLowerCase() || "",
      },
      subscription: {
        plan: subscription?.plan || "free",
        start_date: subscription?.start_date || new Date(),
        end_date: subscription?.end_date || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      },
      status: "active",
    });

    await newSchool.save();

    return res.status(201).json({
      success: true,
      message: "School registered successfully.",
      school: newSchool,
    });

  } catch (error) {
    console.error("Error in registerSchool Controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while registering the school.",
      error: error.message,
    });
  }
};

// @desc    Get all registered schools
// @route   GET /api/v1/superadmin/all-schools
// @access  Private/SuperAdmin
export const getAllSchools = async (req, res) => {
  try {
    // Database se saare schools fetch kiye aur newest first (descending) sort kiya
    const schools = await SchoolModel.find({}).sort({ createdAt: -1 });

    console.log(schools)
    return res.status(200).json({
      success: true,
      count: schools.length,
      schools,
    });
  } catch (error) {
    console.error("Error in getAllSchools Controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching schools list.",
      error: error.message,
    });
  }
};

// @desc    Create a branch/school admin account
// @route   POST /api/v1/superadmin/admins
// @access  Private/SuperAdmin
export const createSchoolAdmin = async (req, res) => {
  try {
    const { name, email, password, schoolId, phone } = req.body;

    // 1. Inputs Validation
    if (!name || !email || !password || !schoolId) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and target school reference are required.",
      });
    }

    // 2. Target School Existence Verification
    const targetSchool = await SchoolModel.findById(schoolId);
    if (!targetSchool) {
      return res.status(404).json({
        success: false,
        message: "The specified school instance does not exist.",
      });
    }

    // 3. Duplicate Admin Email Verification
    const emailNormalized = email.trim().toLowerCase();
    const existingUser = await UserModel.findOne({ email: emailNormalized });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    // 4. Secure Password Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create Multi-Tenant Associated Admin Record
    const newAdmin = new UserModel({
      name: name.trim(),
      email: emailNormalized,
      password: hashedPassword,
      role: "admin",           // Enforcing localized tier role
      school: schoolId,        // Direct reference mapping to isolate school scope
      phone: phone || "",
      status: "active"
    });

    await newAdmin.save();

    // Sensitive field cleanup before responding
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    return res.status(201).json({
      success: true,
      message: `Admin account successfully provisioned for ${targetSchool.name}.`,
      admin: adminResponse,
    });

  } catch (error) {
    console.error("Error in createSchoolAdmin Controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating admin account.",
      error: error.message,
    });
  }
};