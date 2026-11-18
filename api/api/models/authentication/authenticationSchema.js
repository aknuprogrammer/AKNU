const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // optional, but recommended
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "super_admin", "user"],
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("Authentication", userSchema, "users");

module.exports = User;
