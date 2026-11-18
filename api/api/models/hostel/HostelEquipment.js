const mongoose = require("mongoose");

const hostelEquipmentSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
      index: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Furniture",
        "Electronics",
        "Appliances",
        "Bedding",
        "Kitchen",
        "Cleaning",
        "Maintenance",
        "Security",
        "Other",
      ],
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    unit: {
      type: String,
      trim: true,
      maxlength: 20,
      default: "piece",
    },
    brand: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    model: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    serialNumber: {
      type: String,
      trim: true,
      maxlength: 100,
      sparse: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    purchasePrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    supplier: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    warrantyExpiry: {
      type: Date,
      default: null,
    },
    condition: {
      type: String,
      enum: ["New", "Good", "Fair", "Poor", "Needs Repair", "Damaged"],
      default: "Good",
      index: true,
    },
    status: {
      type: String,
      enum: ["available", "in-use", "maintenance", "damaged", "disposed"],
      default: "available",
      index: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    lastMaintenanceDate: {
      type: Date,
      default: null,
    },
    nextMaintenanceDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
hostelEquipmentSchema.index({ hostelId: 1, category: 1 });
hostelEquipmentSchema.index({ floorId: 1, status: 1 });
hostelEquipmentSchema.index({ roomId: 1, status: 1 });
hostelEquipmentSchema.index({ status: 1, condition: 1 });

// Force remove old model definition
if (mongoose.models.HostelEquipment) {
  delete mongoose.models.HostelEquipment;
}

module.exports = mongoose.model("HostelEquipment", hostelEquipmentSchema);

