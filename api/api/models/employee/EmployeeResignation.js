const mongoose = require("mongoose");

// Employee Resignation Schema
const EmployeeResignationSchema = new mongoose.Schema(
  {
    // Employee Information
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },

    // Resignation Details
    resignationDate: {
      type: Date,
      required: true,
    },
    lastWorkingDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    reasonDetails: {
      type: String,
      required: true,
      trim: true,
    },
    noticePeriodDays: {
      type: Number,
      required: true,
      min: 0,
    },

    // Handover Information
    handoverNotes: {
      type: String,
      trim: true,
    },
    handoverTo: {
      type: String,
      trim: true,
    },

    // Attachments (can have multiple files)
    attachments: [
      {
        file: { type: Buffer, required: false },
        fileName: { type: String, trim: true },
        contentType: { type: String, trim: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Resignation Status
    status: {
      type: String,
      enum: ["pending", "under_review", "approved", "rejected", "withdrawn"],
      default: "pending",
    },

    // Review/Approval Information
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    reviewComments: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    approvalComments: {
      type: String,
      trim: true,
    },

    // System Fields
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes for better query performance
EmployeeResignationSchema.index({ employeeId: 1, createdAt: -1 });
EmployeeResignationSchema.index({ email: 1, createdAt: -1 });
EmployeeResignationSchema.index({ department: 1, status: 1 });
EmployeeResignationSchema.index({ status: 1, createdAt: -1 });
EmployeeResignationSchema.index({ resignationDate: 1 });
EmployeeResignationSchema.index({ lastWorkingDate: 1 });

module.exports =
  mongoose.models.EmployeeResignation ||
  mongoose.model("EmployeeResignation", EmployeeResignationSchema, "employee_resignations");

