import mongoose from "mongoose";

// ─── SUBJECT SCHEMA ───────────────────────────────────────────────────────────
const subjectSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true, // Diagram: school_id (NN)
    },
    name: {
      type: String,
      required: [true, "Subject name is required"], // Diagram: name (NN)
      trim: true,
    },
    code: {
      type: String,
      trim: true, // Diagram: code varchar(20) (Not Null nahi hai diagram mein)
    },
    creditHours: {
      type: Number, // Diagram: credit_hours int
    },
  },
  { timestamps: true } // Diagram: created_at (timestamp)
);

// Ek school ke andar duplicate subject names ko rokne ke liye unique index
subjectSchema.index({ school: 1, name: 1 }, { unique: true });

export const Subject = mongoose.model("Subject", subjectSchema);


// ─── TEACHER SUBJECT SECTION SCHEMA (Junction Table) ──────────────────────────
const teacherSubjectSectionSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true, // Diagram: school_id (NN)
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true, // Diagram: teacher_id (NN)
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true, // Diagram: subject_id (NN)
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true, // Diagram: section_id (NN)
    },
  },
  { 
    // Diagram mein 'assigned_at' single timestamp hai, NoSQL mein hum standard strict timestamps 
    // use kar sakte hain jo auto-manage ho sakein.
    timestamps: { createdAt: "assignedAt", updatedAt: false } 
  }
);

// Aik hi section mein aik subject aik hi teacher ko assign ho sake, duplicate data na bane
teacherSubjectSectionSchema.index({ subject: 1, section: 1, teacher: 1 }, { unique: true });

export const TeacherSubjectSection = mongoose.model(
  "TeacherSubjectSection",
  teacherSubjectSectionSchema
);