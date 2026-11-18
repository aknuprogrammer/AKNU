const mongoose = require("mongoose");

// Document Acknowledgment Schema
// This stores a permanent record of document receipts, even if student leaves
const DocumentAcknowledgmentSchema = new mongoose.Schema(
  {
    // Student reference (can be null if student is deleted)
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      index: true,
    },
    
    // Student identification fields (stored for historical record)
    registrationNumber: {
      type: String,
      required: true,
      index: true,
    },
    hallTicketNo: {
      type: String,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    email: String,
    phone: String,
    
    // Course/Stream/Batch info (stored for historical record)
    course: String,
    stream: String,
    batch: String,
    college: String,
    
    // Acknowledged documents
    documents: [
      {
        docId: { type: String, required: true },
        name: { type: String, required: true },
        documentName: { type: String },
        type: String,
        description: String,
        fileType: { type: String, default: "application/pdf" },
        verified: {
          type: String,
          enum: ["verified", "not_verified"],
          default: "not_verified",
        },
        comment: String,
        acknowledgedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Acknowledgment metadata
    acknowledgedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    acknowledgedBy: {
      type: String, // Could be student name or system
      default: "Student",
    },
    
    // Status
    status: {
      type: String,
      enum: ["active", "revoked", "student_left"],
      default: "active",
    },
    
    // Notes
    notes: String,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes for better query performance
DocumentAcknowledgmentSchema.index({ registrationNumber: 1, acknowledgedAt: -1 });
DocumentAcknowledgmentSchema.index({ studentId: 1, acknowledgedAt: -1 });
DocumentAcknowledgmentSchema.index({ status: 1 });

module.exports = mongoose.model(
  "DocumentAcknowledgment",
  DocumentAcknowledgmentSchema
);

