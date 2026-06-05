import jwt from "jsonwebtoken";
import UserModel from "../model/UserModel.js";

// ─── 1. PROTECT MIDDLEWARE (Token Verification) ─────────────────────────────
export const protect = async (req, res, next) => {
  let token;

  // Check karein agar request headers mein Bearer token maujood hai
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Header se token alag karein ("Bearer <token>")
      token = req.headers.authorization.split(" ")[1];

      // Token ko verify karein
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Database se user nikal kar request object (req.user) mein save karein (password ke bagair)
      req.user = await UserModel.findById(decoded.id).select("-password");

      // Agar user database mein exist nahi karta ya deleted hai
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      // Agar user active nahi hai (suspended/inactive)
      if (req.user.status !== "active") {
        return res.status(403).json({ message: `Your account is ${req.user.status}. Access denied.` });
      }

      // Agle middleware ya controller par bhejein
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed", error: error.message });
    }
  }

  // Agar token hi na bheja gaya ho
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};


// ─── 2. ISSUPERADMIN MIDDLEWARE (Role Authorization) ─────────────────────────
export const isSuperAdmin = (req, res, next) => {
  // req.user hume upar wale 'protect' middleware se mil jayega
  if (req.user && req.user.role === "superadmin") {
    next(); // Agar superadmin hai toh allow karein
  } else {
    res.status(403).json({ message: "Access denied. Only Superadmin can access this route." });
  }
};


// ─── 3. ISADMIN MIDDLEWARE (Optional: School Admin Verification) ─────────────
export const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "superadmin")) {
    next(); // Superadmin ya Admin dono ko allow karne ke liye
  } else {
    res.status(403).json({ message: "Access denied. Admin rights required." });
  }
};