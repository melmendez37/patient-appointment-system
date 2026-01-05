import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["doctor", "staff", "admin"], required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null},
    isActive: { type: Boolean, default: false},
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

