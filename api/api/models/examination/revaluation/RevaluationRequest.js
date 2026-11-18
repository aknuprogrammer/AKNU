const mongoose = require("mongoose");

const revaluationRequestSchema = new mongoose.Schema(
  {
    // Auto-generated unique request number
    requestNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
      trim: true,
    },

    // Student Information
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", // Model is registered as "Student" not "FromStudents"
      index: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    hallTicketNumber: {
      type: String,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    // Course-Stream-Semester mapping reference
    courseStreamMappingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseStreamMapping",
      index: true,
    },

    // Subject and Result Information
    resultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CombinedResult",
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    subjectName: {
      type: String,
      trim: true,
    },

    // Original Marks (from CombinedResult)
    originalMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    originalMaxMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    originalGrade: {
      type: String,
      trim: true,
    },
    originalStatus: {
      type: String,
      enum: ["PASS", "FAIL", "ABSENT"],
      default: "FAIL",
    },

    // Revaluation Marks (entered after re-evaluation)
    revaluationMarks: {
      type: Number,
      default: null,
      min: 0,
    },
    revaluationMaxMarks: {
      type: Number,
      default: null,
      min: 0,
    },
    difference: {
      type: Number,
      default: 0, // Calculated: revaluationMarks - originalMarks
    },
    newGrade: {
      type: String,
      trim: true,
    },
    newStatus: {
      type: String,
      enum: ["PASS", "FAIL", "ABSENT", null],
      default: null,
    },

    // Payment Information
    paymentTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExaminationPaymentTransaction",
      required: true,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
      index: true,
    },

    // Request Status
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
      index: true,
    },

    // Script Retrieval
    scriptRetrieved: {
      type: Boolean,
      default: false,
    },
    scriptRetrievedAt: {
      type: Date,
      default: null,
    },
    scriptRetrievedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    scriptLocation: {
      type: String,
      trim: true,
    },
    scriptBarcode: {
      type: String,
      trim: true,
    },
    bundleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bundle",
      default: null,
    },

    // Evaluator Assignment
    assignedEvaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professor",
      default: null,
      index: true,
    },
    assignedAt: {
      type: Date,
      default: null,
    },

    // Timestamps
    requestDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    revaluationCompletedAt: {
      type: Date,
      default: null,
    },

    // Additional Information
    rejectionReason: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: "revaluation_requests",
  }
);

// Indexes for better query performance
revaluationRequestSchema.index({ registrationNumber: 1, status: 1 });
revaluationRequestSchema.index({ status: 1, createdAt: -1 });
revaluationRequestSchema.index({ studentId: 1, subjectId: 1, status: 1 });
revaluationRequestSchema.index({ paymentTransactionId: 1 });
revaluationRequestSchema.index({ assignedEvaluatorId: 1, status: 1 });

// Pre-save middleware to calculate difference
revaluationRequestSchema.pre("save", function (next) {
  if (this.revaluationMarks !== null && this.revaluationMarks !== undefined) {
    this.difference = this.revaluationMarks - this.originalMarks;
  }
  next();
});

// Force remove old model definition if exists
if (mongoose.models.RevaluationRequest) {
  delete mongoose.models.RevaluationRequest;
}

const RevaluationRequest = mongoose.model(
  "RevaluationRequest",
  revaluationRequestSchema
);

module.exports = RevaluationRequest;
