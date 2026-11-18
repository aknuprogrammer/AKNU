const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema(
  {
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
    },
    floorNumber: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalRooms: {
      type: Number,
      required: true,
      min: 1,
      default: 0,
    },
    totalBeds: {
      type: Number,
      min: 0,
      default: 0,
    },
    occupiedBeds: {
      type: Number,
      min: 0,
      default: 0,
    },
    availableBeds: {
      type: Number,
      min: 0,
      default: 0,
    },
    facilities: {
      type: [String],
      default: [],
      enum: [
        "Lift",
        "Common Bathroom",
        "Common Kitchen",
        "Study Room",
        "Recreation Room",
        "Laundry",
        "Water Cooler",
        "WiFi",
        "CCTV",
        "Security",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
blockSchema.index({ hostelId: 1, code: 1 }, { unique: true });
blockSchema.index({ hostelId: 1, status: 1 });

// Virtual for calculating available beds
blockSchema.virtual("calculatedAvailableBeds").get(function () {
  return Math.max(0, this.totalBeds - this.occupiedBeds);
});

// Pre-save hook to update available beds
blockSchema.pre("save", function (next) {
  this.availableBeds = Math.max(0, this.totalBeds - this.occupiedBeds);
  next();
});

// Ensure virtuals are included in JSON
blockSchema.set("toJSON", { virtuals: true });
blockSchema.set("toObject", { virtuals: true });

// Force remove old model definition
if (mongoose.models.Block) {
  delete mongoose.models.Block;
}

module.exports = mongoose.model("Block", blockSchema);

