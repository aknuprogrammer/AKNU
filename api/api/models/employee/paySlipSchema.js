const mongoose = require("mongoose");

const paySlipSchema = new mongoose.Schema(
  {
    employeeName: { type: String, required: true, trim: true },
    employeeId: { type: String, required: true, trim: true, index: true },
    payPeriod: { type: String, required: true, trim: true }, // e.g., "January 2024" or "2024-01"
    paidDays: { type: Number, required: true, min: 0 },
    lossOfPayDays: { type: Number, default: 0, min: 0 },
    payDate: { type: Date, required: true, index: true },
    notes: { type: String, trim: true },
    paySlipFile: { type: Buffer },
    paySlipFileContentType: { type: String },
    paySlipFileName: { type: String, trim: true },
    earnings: { type: mongoose.Schema.Types.Mixed }, // Can be object or array
    deductions: { type: mongoose.Schema.Types.Mixed }, // Can be object or array
    grossEarnings: { type: Number, required: true, min: 0 },
    totalDeductions: { type: Number, required: true, min: 0 },
    netPayable: { type: Number, required: true },
    active: { type: Boolean, default: true },
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    approvedBy: { type: String, trim: true }, // Admin user ID or name
    approvedAt: { type: Date },
    rejectionReason: { type: String, trim: true }, // Optional reason if rejected
  },
  { timestamps: true }
);

// Indexes for better query performance
paySlipSchema.index({ employeeId: 1, payDate: -1 });
paySlipSchema.index({ employeeId: 1, payPeriod: 1 });
paySlipSchema.index({ payDate: -1 });
paySlipSchema.index({ payPeriod: 1 });
paySlipSchema.index({ approvalStatus: 1, employeeId: 1 }); // For filtering approved payslips by employee

module.exports =
  mongoose.models.PaySlip ||
  mongoose.model("PaySlip", paySlipSchema, "pay_slips");

