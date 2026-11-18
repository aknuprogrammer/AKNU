const mongoose = require("mongoose");

const floorSchema = new mongoose.Schema(
  {
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
      index: true,
    },
    floorNumber: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 100,
      default: function() {
        // Auto-generate name based on floor number
        if (this.floorNumber === 0) return "Ground Floor";
        if (this.floorNumber === 1) return "First Floor";
        if (this.floorNumber === 2) return "Second Floor";
        if (this.floorNumber === 3) return "Third Floor";
        // For higher floors, use ordinal
        const ordinals = ["", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"];
        if (this.floorNumber <= 10) {
          return `${ordinals[this.floorNumber]} Floor`;
        }
        return `Floor ${this.floorNumber}`;
      },
    },
    totalRooms: {
      type: Number,
      min: 0,
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
        "Fire Safety",
        "Emergency Exit",
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
floorSchema.index({ hostelId: 1, floorNumber: 1 }, { unique: true });
floorSchema.index({ hostelId: 1, status: 1 });

// Virtual for calculating available beds
floorSchema.virtual("calculatedAvailableBeds").get(function () {
  return Math.max(0, this.totalBeds - this.occupiedBeds);
});

// Pre-save hook to update available beds
floorSchema.pre("save", function (next) {
  this.availableBeds = Math.max(0, this.totalBeds - this.occupiedBeds);
  // Auto-generate name if not provided
  if (!this.name || this.name === "") {
    if (this.floorNumber === 0) this.name = "Ground Floor";
    else if (this.floorNumber === 1) this.name = "First Floor";
    else if (this.floorNumber === 2) this.name = "Second Floor";
    else if (this.floorNumber === 3) this.name = "Third Floor";
    else this.name = `Floor ${this.floorNumber}`;
  }
  next();
});

// Ensure virtuals are included in JSON
floorSchema.set("toJSON", { virtuals: true });
floorSchema.set("toObject", { virtuals: true });

// Force remove old model definition
if (mongoose.models.Floor) {
  delete mongoose.models.Floor;
}

module.exports = mongoose.model("Floor", floorSchema);

