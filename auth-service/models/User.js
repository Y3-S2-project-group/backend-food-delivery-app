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
  otpExpires: Date,
  latitude: {
    type: Number,
    default: null,
  },
  longitude: {
    type: Number,
    default: null,
  },
  
});

export default mongoose.model("User", UserSchema);
