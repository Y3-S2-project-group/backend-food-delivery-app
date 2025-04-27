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
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: function () {
        return this.role === "delivery-person";
      },
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: function () {
        return this.role === "delivery-person";
      },
    },
  }
});

// Create a 2dsphere index for location
UserSchema.index({ location: "2dsphere" });

export default mongoose.model("User", UserSchema);
