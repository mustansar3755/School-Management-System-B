

import jwt from "jsonwebtoken";
import UserModel from "../model/UserModel.js";
import { AdminModel } from "../model/AdminModel.js";
import { TeacherModel } from "../model/TeacherModel.js";
import { StudentModel } from "../model/StudentModel.js";


// JWT Token Generator Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ─── REGISTER USER (All Roles) ────────────────────────────────────────────────
export const registerUser = async (req, res) => {
  try {
    const { email, password, role, schoolId, name, ...profileData } = req.body;

    // 1. Check agar user pehle se exist karta hai
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // 2. Central User create karein (Password pre-save hook se auto-hash hoga)
    const user = await UserModel.create({
      email,
      password,
      role,
    });

    // 3. Role ke mutabiq specific profile table mein data insert karein
    let profile = null;

    if (role === "superadmin" || role === "admin") {
      profile = await AdminModel.create({
        user: user._id,
        school: role === "superadmin" ? null : schoolId, // Superadmin ka school nahi hota
        name,
        phone: profileData.phone,
        isSuperAdmin: role === "superadmin",
      });
    } 
    else if (role === "teacher") {
      profile = await TeacherModel.create({
        user: user._id,
        school: schoolId,
        name,
        phone: profileData.phone,
        address: profileData.address,
        qualifications: profileData.qualifications,
        salary: profileData.salary,
        joiningDate: profileData.joiningDate,
      });
    } 
    else if (role === "student") {
      profile = await StudentModel.create({
        user: user._id,
        school: schoolId,
        section: profileData.sectionId, // Section connected to class implicitly
        name,
        fatherName: profileData.fatherName,
        motherName: profileData.motherName,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        address: profileData.address,
        phone: profileData.phone,
        rollNumber: profileData.rollNumber,
        admissionDate: profileData.admissionDate,
      });
    }

    // 4. Response send karein
    res.status(201).json({
      message: `${role} registered successfully`,
      token: generateToken(user._id),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      profile,
    });

  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};
// ─── LOGIN USER (Universal Login) ────────────────────────────────────────────
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. User ko dhoondein aur check karein ke status active hai ya nahi
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: `Your account is ${user.status}. Contact Admin.` });
    }

    // 2. Password verify karein (User model ka method call hoga)
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. User ke role ke mutabiq dynamic profile data fetch karein
    let profileDetails = null;
    if (user.role === "superadmin" || user.role === "admin") {
      profileDetails = await AdminModel.findOne({ user: user._id }).populate("school");
      // Last login timestamp update karein
      if (profileDetails) await profileDetails.updateLastLogin();
    } else if (user.role === "teacher") {
      profileDetails = await TeacherModel.findOne({ user: user._id }).populate("school");
    } else if (user.role === "student") {
      profileDetails = await StudentModel.findOne({ user: user._id }).populate("school section");
    }

    // 4. Token aur data return karein
    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      profile: profileDetails,
    });

  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};