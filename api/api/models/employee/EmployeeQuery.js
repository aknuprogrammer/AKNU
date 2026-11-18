const mongoose = require("mongoose");

// Employee Query Schema
const EmployeeQuerySchema = new mongoose.Schema(
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

    // Query Details
    queryType: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
      default: "medium",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
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

    // Query Status
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },

    // Response/Resolution
    response: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
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
EmployeeQuerySchema.index({ employeeId: 1, createdAt: -1 });
EmployeeQuerySchema.index({ email: 1, createdAt: -1 });
EmployeeQuerySchema.index({ department: 1, status: 1 });
EmployeeQuerySchema.index({ priority: 1, status: 1 });
EmployeeQuerySchema.index({ status: 1, createdAt: -1 });
EmployeeQuerySchema.index({ queryType: 1 });

module.exports =
  mongoose.models.EmployeeQuery ||
  mongoose.model("EmployeeQuery", EmployeeQuerySchema, "employee_queries");
