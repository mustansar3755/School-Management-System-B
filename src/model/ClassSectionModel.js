import mongoose from "mongoose";

// ─── CLASS SCHEMA ─────────────────────────────────────────────────────────────
const classSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true, // Diagram: school_id (NN)
    },
    name: {
      type: String,
      required: [true, "Class name is required"], // Diagram: class_name (NN)
      trim: true,
    },
    grade: { 
      type: Number // Diagram: grade_level (int)
    }, 
    isActive: { 
      type: Boolean, 
      default: true 
    },
  },
  { timestamps: true } // Diagram: created_at (timestamp)
);

// Har school ke andar class name unique hona chahiye
classSchema.index({ school: 1, name: 1 }, { unique: true });

export const Class = mongoose.model("ClassModel", classSchema);


// ─── SECTION SCHEMA ───────────────────────────────────────────────────────────
const sectionSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true, // Diagram: school_id (NN)
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true, // Diagram: class_id (NN)
    },
    name: {
      type: String,
      required: [true, "Section name is required"], // Diagram: section_name (NN)
      trim: true,
    },
    capacity: { 
      type: Number // UPDATED: 'maxCapacity' ko badal kar diagram ke mutabiq 'capacity' kr diya hai
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher", // Yeh field extra hai (diagram main nahi hai, pr logic wise theek hai agar aap rakhna chahein)
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
  },
  { timestamps: true } // Diagram: created_at (timestamp)
);

// Har class ke andar section name unique hona chahiye
sectionSchema.index({ class: 1, name: 1 }, { unique: true });

export const Section = mongoose.model("SectionModel", sectionSchema);