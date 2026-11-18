// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, default: "user" }
// });

// module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    trim: true,
    minlength: [6, "Password must be at least 6 characters"],
  },
  role: { type: String, default: "user" },
  pin: {
    type: Number,
    min: [100000, "PIN must be at least 6 digits (100000-999999)"],
    max: [999999, "PIN cannot exceed 6 digits (100000-999999)"],
    validate: {
      validator: function (v) {
        return (
          v === null ||
          v === undefined ||
          (Number.isInteger(v) && v >= 100000 && v <= 999999)
        );
      },
      message: "PIN must be exactly 6 digits (100000-999999)",
    },
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [50, "Username cannot exceed 50 characters"],
  },
  employeeId: { type: String, unique: true, sparse: true },
  campus: { type: String },
  branch: { type: String },
  department: { type: String },
  designation: { type: String },
  jobTitle: { type: String },
  fullName: { type: String },
  phone: { type: String },
  facultyId: { type: String },
  university: { type: mongoose.Types.ObjectId, ref: "universities" },
  college: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
