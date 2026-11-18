const mongoose = require("mongoose");

const credentialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"],
  },
  role: {
    type: String,
    required: [true, "Please add a role"],
    trim: true,
    maxlength: [50, "Role cannot be more than 50 characters"],
  },
  phone: {
    type: String,
    required: [true, "Please add a phone number"],
    match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, "Please add a valid phone number"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  username: {
    type: String,
    required: [true, "Please add a username"],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [20, "Username cannot be more than 20 characters"],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  accessType: {
    type: String,
    ref: "AccessType",
    default: "user",
  },
});

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a college name"],
      unique: true,
      trim: true,
      maxlength: [100, "College name cannot be more than 100 characters"],
    },
    address: { type: String, required: true },
    contactPerson: { type: String, required: true },
    contactPersonPhone: {
      type: String,
      required: true,
      match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, "Please add a valid phone number"],
    },
    contactPersonEmail: {
      type: String,
      required: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    principal: { type: String, required: true },
    principalEmail: {
      type: String,
      required: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    principalPhone: {
      type: String,
      required: true,
      match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, "Please add a valid phone number"],
    },
    collegePhone: {
      type: String,
      required: true,
      match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, "Please add a valid phone number"],
    },
    credentials: [credentialSchema],

    // ✅ Replace string products with references
    modules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module", // Reference to your Module model
      },
    ],

    students: {
      type: Number,
      default: 0,
      min: [0, "Students count cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    subscription: {
      type: String,
      enum: ["Basic", "Standard", "Premium"],
      default: "Basic",
    },
    revenue: {
      type: Number,
      default: 0,
      min: [0, "Revenue cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
collegeSchema.index({ name: "text", address: "text" });

module.exports = mongoose.model("PinkmoonMasterCollege", collegeSchema);
