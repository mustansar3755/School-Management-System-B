import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Ab 'name', 'phone', aur 'address' directly Student/Teacher profiles handle karenge.
    // User model mein hum sirf wahi cheezain rakhein ge jo core Authentication ke liye chahiye.
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "teacher", "student"],
      default: "student",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  { timestamps: true } // created_at aur updated_at khud manage karega
);

// --- PASSWORD HASHING (Pre-Save Middleware) ---
userSchema.pre("save", async function () {
  // Agar password modify nahi hua, to chup chap aage nikal jao
  if (!this.isModified("password")) return null;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error; // Save operation fail kar do agar hashing mein error aaye
  }
});

// --- PASSWORD VERIFICATION METHOD ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Model naming convention hamesha Singular (e.g. "User") rakhna best practice hai, 
// Mongoose iska plural ("users") khud collection name bana deta hai.
const UserModel = mongoose.model("UserModel", userSchema);

export default UserModel;