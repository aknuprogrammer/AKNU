const mongoose = require("mongoose");

const libraryInfoSchema = new mongoose.Schema(
  {
    libraryCode: {
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
    libraryType: {
      type: String,
      enum: ["School", "College", "University", "Public", "Private"],
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    openingTime: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional field
          // Validate time format (HH:MM or HH:MM:SS)
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(v);
        },
        message: "Please enter a valid time format (HH:MM or HH:MM:SS)",
      },
    },
    closingTime: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional field
          // Validate time format (HH:MM or HH:MM:SS)
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(v);
        },
        message: "Please enter a valid time format (HH:MM or HH:MM:SS)",
      },
    },
    headLibrarianName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    headLibrarianContact: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    headLibrarianEmail: {
      type: String,
      trim: true,
      maxlength: 100,
      lowercase: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional field
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please enter a valid email address",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
libraryInfoSchema.index({ libraryCode: 1 });
libraryInfoSchema.index({ name: 1 });
libraryInfoSchema.index({ libraryType: 1 });
libraryInfoSchema.index({ name: 1, libraryType: 1 }); // Compound index for search

// Pre-save hook to update updatedAt
libraryInfoSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition (prevents re-compilation errors)
if (mongoose.models.LibraryInfo) {
  delete mongoose.models.LibraryInfo;
}

module.exports = mongoose.model("LibraryInfo", libraryInfoSchema);

