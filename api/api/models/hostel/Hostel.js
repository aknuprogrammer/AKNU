const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
      index: true,
    },
    hostelTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HostelType",
      required: true,
      index: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 0,
    },
    occupied: {
      type: Number,
      default: 0,
      min: 0,
    },
    numberOfFloors: {
      type: Number,
      min: 1,
      max: 50,
      default: 1,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    wardenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warden",
      required: false,
      index: true,
    },
    wardenName: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
      index: true,
    },
    facilities: {
      type: [String],
      default: [],
    },
    facilityCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
hostelSchema.index({ code: 1 });
hostelSchema.index({ hostelTypeId: 1 });
hostelSchema.index({ status: 1 });
hostelSchema.index({ wardenId: 1 });
hostelSchema.index({ hostelTypeId: 1, status: 1 }); // Compound index for filtering

// Pre-save hook to update updatedAt and validate data
hostelSchema.pre("save", function (next) {
  console.log("=== PRE-SAVE HOOK ===");
  console.log("Collection name:", this.constructor.collection.name);
  console.log("this.name:", this.name);
  console.log("this.code:", this.code);
  console.log("this.capacity:", this.capacity);
  console.log("this.hostelTypeId:", this.hostelTypeId);
  console.log("Full this.toObject():", JSON.stringify(this.toObject(), null, 2));
  console.log("this.isNew:", this.isNew);
  console.log("Modified paths:", this.modifiedPaths());
  console.log("Document keys:", Object.keys(this.toObject()));
  
  // Don't manually set updatedAt - let timestamps handle it
  // this.updatedAt = Date.now(); // REMOVED - timestamps option handles this
  
  next();
});

// Virtual for getting warden details
hostelSchema.virtual("warden", {
  ref: "Warden",
  localField: "wardenId",
  foreignField: "_id",
  justOne: true,
});

// Virtual for getting hostel type details
hostelSchema.virtual("hostelType", {
  ref: "HostelType",
  localField: "hostelTypeId",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtuals are included in JSON output
hostelSchema.set("toJSON", { virtuals: true });
hostelSchema.set("toObject", { virtuals: true });

// Force remove old model definition (prevents re-compilation errors)
if (mongoose.models.Hostel) {
  delete mongoose.models.Hostel;
}

// EXACT SAME PATTERN AS WARDEN AND HOSTELTYPE - no collection name specified
// Mongoose will automatically use "hostels" (pluralized from "Hostel")
module.exports = mongoose.model("Hostel", hostelSchema);

