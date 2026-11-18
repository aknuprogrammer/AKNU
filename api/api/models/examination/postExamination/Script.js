const mongoose = require("mongoose");

const scriptSchema = new mongoose.Schema(
  {
    scriptBarcode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    originalScriptNumber: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
      default: null,
    },
    bundleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bundle",
      required: true,
      index: true,
    },
    bundleBarcode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    hallTicketNumber: {
      type: String,
      trim: true,
      default: null,
    },
    studentName: {
      type: String,
      trim: true,
      default: null,
    },
    rollNumber: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["Registered", "Allocated", "Evaluated", "Scrutinized"],
      default: "Registered",
      index: true,
    },
    evaluatorId: {
      type: String,
      trim: true,
      index: true,
      default: null,
    },
    evaluatorName: {
      type: String,
      trim: true,
      default: null,
    },
    allocatedAt: {
      type: Date,
      default: null,
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    marks: {
      firstEvaluation: {
        marks: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
        total: {
          type: Number,
          default: 0,
        },
        remarks: {
          type: String,
          trim: true,
          default: "",
        },
        evaluatedAt: {
          type: Date,
          default: null,
        },
        evaluatorId: {
          type: String,
          trim: true,
          default: null,
        },
      },
      secondEvaluation: {
        marks: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
        total: {
          type: Number,
          default: 0,
        },
        remarks: {
          type: String,
          trim: true,
          default: "",
        },
        evaluatedAt: {
          type: Date,
          default: null,
        },
        evaluatorId: {
          type: String,
          trim: true,
          default: null,
        },
      },
      thirdEvaluation: {
        marks: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
        total: {
          type: Number,
          default: 0,
        },
        remarks: {
          type: String,
          trim: true,
          default: "",
        },
        evaluatedAt: {
          type: Date,
          default: null,
        },
        evaluatorId: {
          type: String,
          trim: true,
          default: null,
        },
      },
      finalMarks: {
        type: Number,
        default: null,
      },
    },
    scannedAt: {
      type: Date,
      default: null, // Don't set default - will be set when script is actually registered/scanned
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    sequenceNumber: {
      type: Number,
      required: true,
    },
    scrutinyRemarks: {
      type: String,
      trim: true,
      default: "",
    },
    scrutinizedAt: {
      type: Date,
      default: null,
    },
    scrutinizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Note: rollNumber and evaluatorId already have index: true in field definitions
scriptSchema.index({ bundleId: 1, status: 1 });
scriptSchema.index({ subjectCode: 1, status: 1 });
scriptSchema.index({ hallTicketNumber: 1 });
scriptSchema.index({ evaluatorId: 1, status: 1 }); // Compound index - keep this

// Pre-save hook to update updatedAt
scriptSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.Script) {
  delete mongoose.models.Script;
}

module.exports = mongoose.model("Script", scriptSchema);

