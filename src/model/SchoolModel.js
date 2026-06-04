import mongoose from "mongoose";

// ─── ENUMS (ER diagram ke mutabiq) ───────────────────────────────────────────
const SUBSCRIPTION_PLANS = ["free", "basic", "standard", "premium"];
const SCHOOL_STATUSES = ["active", "inactive", "suspended", "expired"];

const schoolSchema = new mongoose.Schema(
  {
    // ── Basic Info ─────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "School name is required"],
      trim: true,
      maxlength: 150,
    },

    // ER diagram mein address = text (single field)
    address: {
      type: String,
      trim: true,
    },

    // ── Owner Info (ER diagram se add) ─────────────────────────────────────
    owner: {
      name: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      phone: {
        type: String,
        maxlength: 20,
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
        maxlength: 100,
      },
    },

    // ── Branding ───────────────────────────────────────────────────────────
    school_logo: {
      type: String, // URL to logo image
      maxlength: 255,
    },

    // ── Subscription (ER diagram se add) ───────────────────────────────────
    subscription: {
      plan: {
        type: String,
        enum: {
          values: SUBSCRIPTION_PLANS,
          message: "{VALUE} is not a valid subscription plan",
        },
        default: "free",
      },
      start_date: {
        type: Date,
      },
      end_date: {
        type: Date,
      },
      // Computed helper: kya subscription abhi active hai?
      // (real check subscriptionIsActive() method se karo)
    },

    // ── Status (ER diagram se add) ─────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: SCHOOL_STATUSES,
        message: "{VALUE} is not a valid status",
      },
      default: "active",
    },

    // ── Admin Relation ─────────────────────────────────────────────────────
    // ER diagram mein relation line Admin table ki taraf ja rahi thi
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
    ],

    // ── Extra useful fields ────────────────────────────────────────────────
    // (production mein kaam aate hain)
    code: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      // e.g. "LHR-001" — superadmin assign karta hai
    },
    contact_phone: {
      type: String,
    },
    contact_email: {
      type: String,
      lowercase: true,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt auto
  }
);

// ─── INDEXES ──────────────────────────────────────────────────────────────────
schoolSchema.index({ status: 1 });
schoolSchema.index({ "subscription.end_date": 1 });
schoolSchema.index({ "subscription.plan": 1 });

// ─── VIRTUAL: subscription expired hai ya nahi ────────────────────────────────
schoolSchema.virtual("subscriptionIsActive").get(function () {
  if (!this.subscription?.end_date) return false;
  return new Date() < new Date(this.subscription.end_date);
});

// ─── INSTANCE METHOD: subscription days remaining ────────────────────────────
schoolSchema.methods.daysRemaining = function () {
  if (!this.subscription?.end_date) return 0;
  const diff = new Date(this.subscription.end_date) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// ─── PRE-SAVE: agar subscription end ho gayi to status suspend karo ──────────
schoolSchema.pre("save", function (next) {
  if (
    this.subscription?.end_date &&
    new Date() > new Date(this.subscription.end_date) &&
    this.status === "active"
  ) {
    this.status = "expired";
  }
  next();
});

export default mongoose.model("SchoolModel", schoolSchema);