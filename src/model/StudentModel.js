import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true, // Diagram: school_id (NN)
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SectionModel",
      required: true, // Diagram: section_id (NN)
    },
    name: {
      type: String,
      required: [true, "Student name is required"], // Diagram: name (NN)
      trim: true,
    },
    fatherName: { 
      type: String // Diagram: father_name
    },
    dateOfBirth: { 
      type: Date // Diagram: date_of_birth
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"], // Diagram: student_gender_type (Enum)
    },
    address: { 
      type: String // Diagram: address (text)
    },
    phone: { 
      type: String // Diagram: phone
    },
    profileImg: { 
      type: String // UPDATED: 'avatar' ko badal kar diagram ke mutabiq 'profileImg' kar diya
    },
    rollNumber: {
      type: String, // Diagram: roll_number
      trim: true,
    },
    admissionDate: { 
      type: Date // Diagram: admission_date
    },
    status: {
      type: String,
      enum: ["active", "inactive", "graduated", "transferred"], // Diagram: student_status_type (Enum)
      default: "active",
    },
  },
  { timestamps: true } // Diagram: created_at (timestamp)
);

// Har school ke andar unique roll number rakhne ke liye index
studentSchema.index({ school: 1, rollNumber: 1 }, { unique: true });

export const StudentModel = mongoose.model("StudentModel", studentSchema);