import mongoose from "mongoose";

const SUBSCRIPTION_PLANS = ["free", "basic", "standard", "premium"];
const SCHOOL_STATUSES = ["active", "inactive", "suspended", "expired"];

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "School name is required"],
      trim: true,
      maxlength: 150,
    },
    address: {
      type: String,
      trim: true,
    },
    owner: {
      name: { type: String, trim: true, maxlength: 100 },
      phone: { type: String, maxlength: 20 },
      email: { type: String, lowercase: true, trim: true, maxlength: 100 },
    },
    school_logo: {
      type: String,
      maxlength: 255,
    },
    subscription: {
      plan: {
        type: String,
        enum: {
          values: SUBSCRIPTION_PLANS,
          message: "{VALUE} is not a valid subscription plan",
        },
        default: "free",
      },
      start_date: { type: Date },
      end_date: { type: Date },
    },
    status: {
      type: String,
      enum: {
        values: SCHOOL_STATUSES,
        message: "{VALUE} is not a valid status",
      },
      default: "active",
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdminModel", // Admin model ke registered naam se match hona chahiye
      },
    ],
    code: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    contact_phone: { type: String },
    contact_email: { type: String, lowercase: true },
  },
  {
    timestamps: true,
  }
);

// ─── INDEXES ──────────────────────────────────────────────────────────────────
schoolSchema.index({ status: 1 });
schoolSchema.index({ "subscription.end_date": 1 });
schoolSchema.index({ "subscription.plan": 1 });

// ─── VIRTUAL ──────────────────────────────────────────────────────────────────
schoolSchema.virtual("subscriptionIsActive").get(function () {
  if (!this.subscription?.end_date) return false;
  return new Date() < new Date(this.subscription.end_date);
});

// ─── INSTANCE METHOD ──────────────────────────────────────────────────────────
schoolSchema.methods.daysRemaining = function () {
  if (!this.subscription?.end_date) return 0;
  const diff = new Date(this.subscription.end_date) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// ─── PRE-SAVE HOOK ────────────────────────────────────────────────────────────
schoolSchema.pre("save", async function () {
  // 'this' current processing document ko refer karta hai

  if (
    this.subscription?.end_date &&
    new Date() > new Date(this.subscription.end_date) &&
    this.status === "active"
  ) {
    this.status = "expired";
  }
});

// ─── CRUCIAL FIX FOR COMPASS & REFS ───────────────────────────────────────────
// 1. Pehla argument "School" rakha taake baki models mein ref: "School" kaam kare.
// 2. Teesra argument "schoolmodels" diya taake yeh Compass wali purani collection ko hi target kare.
export default mongoose.model("School", schoolSchema, "schoolmodels");