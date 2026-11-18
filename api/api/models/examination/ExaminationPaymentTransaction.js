const mongoose = require("mongoose");

const examinationPaymentTransactionSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    registration_number: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    student_name: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    semester: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },

    // Course-Stream-Semester mapping reference (like students collection)
    courseStreamMappingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseStreamMapping",
      index: true,
    },

    // Payment Details
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    payment_gateway: {
      type: String,
      default: "Easebuzz",
      trim: true,
    },
    payment_status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    // Subject Details - Now storing courseStreamMappingIds instead of subject names
    regular_subjects: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "CourseStreamMapping",
      default: [],
    },
    supplementary_subjects: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "CourseStreamMapping",
      default: [],
    },
    regular_subject_count: {
      type: Number,
      default: 0,
    },
    supplementary_subject_count: {
      type: Number,
      default: 0,
    },
    // Revaluation subject details - stores result IDs for revaluation applications
    revaluation_subjects: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    revaluation_subject_count: {
      type: Number,
      default: 0,
    },

    // Transaction Data from Easebuzz
    easebuzz_transaction_data: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    bank_reference_number: {
      type: String,
      trim: true,
    },
    payment_mode: {
      type: String,
      trim: true,
    },
    payment_link: {
      type: String,
      trim: true,
    },

    // Sub-merchant attribution (marketplace)
    sub_merchant_id: {
      type: String,
      trim: true,
      index: true,
    },
    merchant_key: {
      type: String,
      trim: true,
    },
    bank_account: {
      type: String,
      trim: true,
    },
    bank_name: {
      type: String,
      trim: true,
    },
    account_number: {
      type: String,
      trim: true,
    },
    ifsc_code: {
      type: String,
      trim: true,
    },

    // Error Information
    error_message: {
      type: String,
      trim: true,
    },

    // Hall Ticket Information
    hall_ticket_id: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    hall_ticket_generated: {
      type: Boolean,
      default: false,
      index: true,
    },
    hall_ticket_generated_at: {
      type: Date,
      default: null,
    },

    // Timestamps
    payment_completed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
  }
);

// Indexes for better query performance
// Note: registration_number, payment_status, transaction_id, and sub_merchant_id already have index: true in field definitions
examinationPaymentTransactionSchema.index({ createdAt: -1 });
examinationPaymentTransactionSchema.index({ merchant_key: 1 });

// Update timestamp before saving
examinationPaymentTransactionSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Force remove old model definition if exists
if (mongoose.models.ExaminationPaymentTransaction) {
  delete mongoose.models.ExaminationPaymentTransaction;
}

const ExaminationPaymentTransaction = mongoose.model(
  "ExaminationPaymentTransaction",
  examinationPaymentTransactionSchema
);

module.exports = ExaminationPaymentTransaction;
