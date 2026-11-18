const mongoose = require("mongoose");

// Employee Bill Schema
const EmployeeBillSchema = new mongoose.Schema(
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

    // Bill Details
    billType: {
      type: String,
      required: true,
      trim: true,
    },
    billAmount: {
      type: Number,
      required: true,
      min: [0, "Bill amount must be positive"],
    },
    billDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Bill Receipt/Documents (can have multiple files)
    billDocuments: [
      {
        file: { type: Buffer, required: false },
        fileName: { type: String, trim: true },
        contentType: { type: String, trim: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Bill Status
    status: {
      type: String,
      enum: ["pending", "under_review", "approved", "rejected", "paid"],
      default: "pending",
    },

    // Approval/Rejection Details
    remarks: {
      type: String,
      trim: true,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paidAt: {
      type: Date,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // System Fields
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes for better query performance
EmployeeBillSchema.index({ employeeId: 1, createdAt: -1 });
EmployeeBillSchema.index({ email: 1, createdAt: -1 });
EmployeeBillSchema.index({ department: 1, status: 1 });
EmployeeBillSchema.index({ billType: 1, status: 1 });
EmployeeBillSchema.index({ status: 1, createdAt: -1 });
EmployeeBillSchema.index({ billDate: 1 });

module.exports =
  mongoose.models.EmployeeBill ||
  mongoose.model("EmployeeBill", EmployeeBillSchema, "employee_bills");

