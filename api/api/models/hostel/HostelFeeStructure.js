const mongoose = require("mongoose");

const hostelFeeStructureSchema = new mongoose.Schema(
  {
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
      index: true,
    },
    hostelName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    roomType: {
      type: String,
      enum: ["Single", "Double", "Triple", "Quad", "Dormitory"],
      required: true,
    },
    capacity: {
      type: Number,
      min: 1,
      default: 1,
    },
    monthlyFee: {
      type: Number,
      required: true,
      min: 0,
    },
    annualFee: {
      type: Number,
      required: true,
      min: 0,
    },
    deposit: {
      type: Number,
      default: 0,
      min: 0,
    },
    messCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    maintenanceFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    electricityCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    waterCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    otherCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAnnualFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    effectiveTo: {
      type: Date,
    },
    description: {
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
hostelFeeStructureSchema.index({ hostelId: 1, roomType: 1, status: 1 });
hostelFeeStructureSchema.index({ status: 1 });

// Pre-save hook to calculate total annual fee
hostelFeeStructureSchema.pre("save", function (next) {
  const baseTotal =
    (this.annualFee || 0) +
    (this.deposit || 0) +
    (this.messCharges || 0) * 12 +
    (this.maintenanceFee || 0) +
    (this.electricityCharges || 0) +
    (this.waterCharges || 0) +
    (this.otherCharges || 0);
  
  // For dormitory, divide by capacity (per person cost)
  if (this.roomType === "Dormitory" && this.capacity && this.capacity > 1) {
    this.totalAnnualFee = Math.round(baseTotal / this.capacity);
  } else {
    this.totalAnnualFee = baseTotal;
  }
  next();
});

// Ensure virtuals are included in JSON
hostelFeeStructureSchema.set("toJSON", { virtuals: true });
hostelFeeStructureSchema.set("toObject", { virtuals: true });

// Force remove old model definition
if (mongoose.models.HostelFeeStructure) {
  delete mongoose.models.HostelFeeStructure;
}

module.exports = mongoose.model("HostelFeeStructure", hostelFeeStructureSchema);

