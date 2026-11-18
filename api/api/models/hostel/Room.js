const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
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
    roomNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
      index: true,
    },
    roomType: {
      type: String,
      enum: ["Single", "Double", "Triple", "Quad", "Dormitory"],
      required: true,
      default: "Double",
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
      default: 2,
    },
    occupied: {
      type: Number,
      min: 0,
      default: 0,
    },
    available: {
      type: Number,
      min: 0,
      default: 0,
    },
    facilities: {
      type: [String],
      default: [],
    },
    facilityCounts: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    floor: {
      type: Number,
      min: 0,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance", "reserved"],
      default: "available",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
roomSchema.index({ hostelId: 1, floorId: 1, roomNumber: 1 }, { unique: true });
roomSchema.index({ floorId: 1, status: 1 });
roomSchema.index({ hostelId: 1, status: 1 });

// Virtual for calculating available beds
roomSchema.virtual("calculatedAvailable").get(function () {
  return Math.max(0, this.capacity - this.occupied);
});

// Pre-save hook to update available beds
roomSchema.pre("save", function (next) {
  this.available = Math.max(0, this.capacity - this.occupied);
  next();
});

// Ensure virtuals are included in JSON
roomSchema.set("toJSON", { virtuals: true });
roomSchema.set("toObject", { virtuals: true });

// Force remove old model definition
if (mongoose.models.Room) {
  delete mongoose.models.Room;
}

module.exports = mongoose.model("Room", roomSchema);

