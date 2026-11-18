const mongoose = require("mongoose");

const publisherSchema = new mongoose.Schema(
  {
    publisherCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    establishedYear: {
      type: Number,
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional field
          const currentYear = new Date().getFullYear();
          return v >= 1000 && v <= currentYear;
        },
        message: "Established year must be between 1000 and current year",
      },
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
publisherSchema.index({ publisherCode: 1 });
publisherSchema.index({ name: 1 });
publisherSchema.index({ status: 1 });
publisherSchema.index({ name: 1, status: 1 }); // Compound index for search

// Pre-save hook to update updatedAt
publisherSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition (prevents re-compilation errors)
if (mongoose.models.Publisher) {
  delete mongoose.models.Publisher;
}

module.exports = mongoose.model("Publisher", publisherSchema);

