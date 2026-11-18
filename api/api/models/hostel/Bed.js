const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema(
  {
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
      index: true,
    },
    floorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Floor",
      required: true,
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    bedNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    bedType: {
      type: String,
      enum: ["Single", "Bunk", "Twin"],
      default: "Single",
    },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "maintenance"],
      default: "available",
      index: true,
    },
    allocatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FromStudents", // Can be student or employee
      default: null,
    },
    allocatedToType: {
      type: String,
      enum: ["student", "staff"],
      default: null,
    },
    allocationDate: {
      type: Date,
      default: null,
    },
    facilities: {
      type: [String],
      default: [],
      enum: [
        "Mattress",
        "Pillow",
        "Bed Sheet",
        "Blanket",
        "Study Table",
        "Chair",
        "Wardrobe",
        "Power Socket",
      ],
    },
    condition: {
      type: String,
      enum: ["Good", "Fair", "Needs Repair", "Damaged"],
      default: "Good",
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bedSchema.index({ roomId: 1, bedNumber: 1 }, { unique: true });
bedSchema.index({ hostelId: 1, status: 1 });
bedSchema.index({ floorId: 1, status: 1 });
bedSchema.index({ roomId: 1, status: 1 });
bedSchema.index({ allocatedTo: 1 });

// Force remove old model definition
if (mongoose.models.Bed) {
  delete mongoose.models.Bed;
}

module.exports = mongoose.model("Bed", bedSchema);

