import mongoose from "mongoose";

// ─── 1. ATTENDANCE SCHEMA ─────────────────────────────────────────────────────
const attendanceSchema = new mongoose.Schema(
  {
    // ER Diagram ke mutabiq: Har student ki har din ki single entry alag document banegi
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true, // Diagram: student_id (NN)
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true, // Diagram: section_id (NN)
    },
    date: {
      type: Date,
      required: true, // Diagram: date (NN)
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "leave"], // Diagram: attendance_status_type (Enum, NN)
      required: true,
    },
    remarks: {
      type: String, // Diagram: remarks varchar(200)
      trim: true,
    },
  },
  { 
    timestamps: { createdAt: "created_at", updatedAt: false } // Diagram: created_at timestamp
  }
);

// Aik student ki aik hi date ko duplicate attendance na lag sake
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });
attendanceSchema.index({ section: 1, date: 1 });

export const Attendance = mongoose.model("Attendance", attendanceSchema);


// ─── 2. EXAM SCHEMA ───────────────────────────────────────────────────────────
const examSchema = new mongoose.Schema(
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
    examName: {
      type: String,
      required: [true, "Exam name is required"], // Diagram: exam_name varchar(100) (NN)
      trim: true,
    },
    examDate: {
      type: Date, // Diagram: exam_date date
    },
    totalMarks: {
      type: Number, // Diagram: total_marks int
    },
  },
  { 
    timestamps: { createdAt: "created_at", updatedAt: false } // Diagram: created_at timestamp
  }
);

export const Exam = mongoose.model("Exam", examSchema);


// ─── 3. RESULT SCHEMA ──────────────────────────────────────────────────────────
const resultSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true, // Diagram: exam_id (NN)
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true, // Diagram: student_id (NN)
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true, // Diagram: subject_id (NN)
    },
    marksObtained: {
      type: Number,
      required: [true, "Marks obtained are required"], // Diagram: marks_obtained decimal(5,2) (NN)
    },
    grade: {
      type: String, // Diagram: grade varchar(5) (e.g., "A+", "B")
      trim: true,
    },
  },
  { 
    timestamps: { createdAt: "created_at", updatedAt: false } // Diagram: created_at timestamp
  }
);

// Unique constraint: Aik hi exam mein, aik student ke, aik subject ke double marks na charh sakein
resultSchema.index({ exam: 1, student: 1, subject: 1 }, { unique: true });

export const Result = mongoose.model("Result", resultSchema);