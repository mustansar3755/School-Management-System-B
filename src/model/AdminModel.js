import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    // ── User Relation (Central Auth se connection) ──────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Yeh hamare main 'User' model se link ho gaya
      required: true,
    },

    // ── School Relation (ER: school_id FK, NN for admin role) ──────────────
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: [
        function () { return this.isSuperAdmin === false; }, 
        "School is required for regular admin role",
      ],
    },

    // ── Basic Info ─────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
      maxlength: 100,
    },

    phone: {
      type: String,
      maxlength: 20,
    },

    // Admin/SuperAdmin ka farq check karne ke liye flag
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },

    // ── Extra fields (Practical) ──────────────────────────
    avatar: { type: String },
    lastLogin: { type: Date },
  },
  {
    timestamps: true, // created_at aur updated_at auto-manage honge
  }
);

// ─── INDEXES ──────────────────────────────────────────────────────────────────
adminSchema.index({ user: 1 }, { unique: true }); // Aik User ka aik hi Admin profile ho sakta hai
adminSchema.index({ school: 1 });                 // School ke saare admins jaldi fetch karne ke liye

// ─── METHOD: last login update ────────────────────────────────────────────────
adminSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  return await this.save();
};

// Model naming convention ke mutabiq singular "Admin"
export const AdminModel = mongoose.model("AdminModel", adminSchema);