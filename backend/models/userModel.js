import mongoose from "mongoose";
import bcrypt from "bcrypt";

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

userSchema.statics.login = async function(email, password) {
  if(!email || !password){
    throw Error("All fields must be filled");
  }

  const user = await this.findOne({ email });
  if(!user){
    throw Error("Incorrect email");
  }
  
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw Error("Incorrect password");
  }

  return user;
}

export const User = mongoose.model("User", userSchema);

