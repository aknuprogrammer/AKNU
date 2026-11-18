const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 100,
      index: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },
    type: {
      type: String,
      enum: ["checkbox", "count", "both"],
      default: "checkbox",
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    icon: {
      type: String,
      trim: true,
      maxlength: 10,
    },
    category: {
      type: String,
      enum: ["room", "hostel", "both"],
      default: "both",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
facilitySchema.index({ status: 1, category: 1 });
facilitySchema.index({ order: 1 });

const Facility = mongoose.model("Facility", facilitySchema);

module.exports = Facility;

