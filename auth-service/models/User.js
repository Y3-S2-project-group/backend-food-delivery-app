import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["customer", "delivery-person", "admin", "restaurant"],
    default: "customer",
  },
  otp: String,
  otpExpires: Date
});

// Create a 2dsphere index for location
UserSchema.index({ location: "2dsphere" });

export default mongoose.model("User", UserSchema);
