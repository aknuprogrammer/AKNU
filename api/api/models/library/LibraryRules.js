const mongoose = require("mongoose");

const libraryRulesSchema = new mongoose.Schema(
  {
    // Reference to Library
    library: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LibraryInfo",
      required: true,
      index: true,
    },
    
    // Issue Limits
    issueDuration: {
      student: {
        type: Number,
        required: true,
        min: [1, "Issue duration must be at least 1 day"],
        default: 14,
      },
      faculty: {
        type: Number,
        required: true,
        min: [1, "Issue duration must be at least 1 day"],
        default: 30,
      },
    },
    
    // Fine Configuration
    finePerDay: {
      student: {
        type: Number,
        required: true,
        min: [0, "Fine per day cannot be negative"],
        default: 5,
      },
      faculty: {
        type: Number,
        required: true,
        min: [0, "Fine per day cannot be negative"],
        default: 2,
      },
    },
    
    // Renewal Limits
    maxRenewals: {
      student: {
        type: Number,
        required: true,
        min: [0, "Max renewals cannot be negative"],
        default: 2,
      },
      faculty: {
        type: Number,
        required: true,
        min: [0, "Max renewals cannot be negative"],
        default: 3,
      },
    },
    
    // Book Limits
    maxBooksLimit: {
      student: {
        type: Number,
        required: true,
        min: [1, "Max books must be at least 1"],
        default: 3,
      },
      faculty: {
        type: Number,
        required: true,
        min: [1, "Max books must be at least 1"],
        default: 5,
      },
    },
    
    // Lost Book Charges
    lostBookCharge: {
      percentage: {
        type: Number,
        min: [0, "Percentage cannot be negative"],
        default: 150,
      },
      fixedAmount: {
        type: Number,
        min: [0, "Fixed amount cannot be negative"],
        default: 500,
      },
      usePercentage: {
        type: Boolean,
        default: true,
      },
    },
    
    // Damaged Book Charges
    damagedBookCharge: {
      percentage: {
        type: Number,
        min: [0, "Percentage cannot be negative"],
        default: 50,
      },
      fixedAmount: {
        type: Number,
        min: [0, "Fixed amount cannot be negative"],
        default: 200,
      },
      usePercentage: {
        type: Boolean,
        default: true,
      },
    },
    
    // Additional Settings
    gracePeriod: {
      type: Number,
      required: true,
      min: [0, "Grace period cannot be negative"],
      default: 3,
    },
    fineCap: {
      type: Number,
      required: true,
      min: [0, "Fine cap cannot be negative"],
      default: 500,
    },
    
    // Status and Metadata
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
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

// Indexes for performance
libraryRulesSchema.index({ library: 1, status: 1 });
libraryRulesSchema.index({ status: 1 });
libraryRulesSchema.index({ createdAt: -1 });

// Ensure only one active rule exists per library
libraryRulesSchema.pre("save", async function (next) {
  if (this.status === "active" && this.isNew) {
    // Set all other rules for this library to inactive
    await mongoose.model("LibraryRules").updateMany(
      { library: this.library, _id: { $ne: this._id }, status: "active" },
      { status: "inactive" }
    );
  }
  next();
});

// Force remove old model definition (prevents re-compilation errors)
if (mongoose.models.LibraryRules) {
  delete mongoose.models.LibraryRules;
}

module.exports = mongoose.model("LibraryRules", libraryRulesSchema);

