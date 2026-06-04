import mongoose from "mongoose";

// ─── FEE STRUCTURE SCHEMA ─────────────────────────────────────────────────────
const feeStructureSchema = new mongoose.Schema(
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
    feeType: {
      type: String,
      required: [true, "Fee type is required"], // Diagram: fee_type (NN) e.g., "Tuition", "Admission"
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"], // Diagram: amount decimal(10,2) (NN)
    },
    frequency: {
      type: String, // Diagram: frequency varchar(20) e.g., "Monthly", "Termly", "Annually"
      trim: true,
    },
  },
  { timestamps: true } // created_at aur updated_at auto-manage honge
);

// Har class ke andar fee type unique rakhne ke liye compound index
feeStructureSchema.index({ class: 1, feeType: 1 }, { unique: true });

export const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);


// ─── FEE PAYMENT SCHEMA ───────────────────────────────────────────────────────
const feePaymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true, // Diagram: student_id (NN)
    },
    feeStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStructure",
      required: true, // Diagram: fee_id (NN)
    },
    amountPaid: {
      type: Number,
      required: [true, "Amount paid is required"], // Diagram: amount_paid decimal(10,2) (NN)
    },
    paymentDate: {
      type: Date,
      required: true, // Diagram: payment_date date (NN)
    },
    receiptNo: {
      type: String,
      required: true, // Diagram: receipt_no varchar(50) (NN)
      unique: true,   // Receipt number hamesha unique hona chahiye
      trim: true,
    },
    paymentMethod: {
      type: String, // Diagram: payment_method varchar(30) e.g., "Cash", "Bank"
      trim: true,
    },
    status: {
      type: String,
      enum: ["paid", "partial", "unpaid"], // Diagram: fee_payment_status_type (Enum)
      default: "unpaid",
    },
  },
  { timestamps: true }
);

// Queries ko fast karne ke liye indexes
feePaymentSchema.index({ student: 1 });
feePaymentSchema.index({ receiptNo: 1 });

export const FeePayment = mongoose.model("FeePayment", feePaymentSchema);