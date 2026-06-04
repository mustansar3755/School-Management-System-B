import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    // ── User Relation (Central Auth se connection) ──────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Central login table se link
      required: true,
      unique: true, // Aik user profile sirf aik hi teacher se link ho sakti hai
    },

    // ── School Relation (ER: school_id FK, NN) ──────────────────────────────
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    // ── Basic Info (ER Columns) ─────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Teacher name is required"], // ER: name (NN)
      trim: true,
    },

    phone: { 
      type: String, // ER: phone varchar(20)
      trim: true, 
    },

    address: { 
      type: String // ER: address text
    },

    qualifications: { 
      type: String // UPDATED: 'qualification' ko badal kar diagram ke mutabiq 'qualifications' (text) kar diya
    },

    salary: { 
      type: Number // ER: salary decimal(10,2)
    },

    profileImg: { 
      type: String // UPDATED: 'avatar' ko badal kar diagram ke mutabiq 'profileImg' kar diya
    },

    joiningDate: { 
      type: Date // ER: joining_date date
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"], // ER: teacher_status_type (Enum)
      default: "active",
    },
  },
  { 
    timestamps: true // ER ka created_at aur updatedAt donon auto-manage honge
  }
);

// Queries ki fast searching ke liye school aur status par index
teacherSchema.index({ school: 1 });
teacherSchema.index({ status: 1 });

export const TeacherModel = mongoose.model("TeacherModel", teacherSchema);