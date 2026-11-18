const mongoose = require("mongoose");

const libraryRackSchema = new mongoose.Schema(
  {
    library: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LibraryInfo",
      required: true,
      index: true,
    },
    rackNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      index: true,
    },
    rackName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    floor: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    section: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    capacity: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
libraryRackSchema.index({ library: 1 });
libraryRackSchema.index({ rackNumber: 1 });
libraryRackSchema.index({ rackName: 1 });
libraryRackSchema.index({ status: 1 });
libraryRackSchema.index({ library: 1, status: 1 }); // Compound index

// Pre-save hook to update updatedAt
libraryRackSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition (prevents re-compilation errors)
if (mongoose.models.LibraryRack) {
  delete mongoose.models.LibraryRack;
}

module.exports = mongoose.model("LibraryRack", libraryRackSchema);

