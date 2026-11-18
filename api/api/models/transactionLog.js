const mongoose = require("mongoose");

const transactionLogSchema = new mongoose.Schema({
  cid: { type: String, maxlength: 12 },                 // Customer ID
  crn: { type: String, maxlength: 45 },                 // Customer Reference Number
  rid: { type: String, maxlength: 45 },                 // Request ID
  refno: { type: String, maxlength: 45 },               // Gateway Reference Number
  amount: { type: String, maxlength: 45 },              // Transaction Amount
  remarks: { type: String, maxlength: 95 },             // Remarks or notes

  paymentStatus: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
    default: "PENDING"
  },
  paymentMode: { type: String },                        // UPI, CARD, NETBANKING, etc.
  paymentGateway: { type: String },                     // Razorpay, Axis, PhonePe, etc.
  errorCode: { type: String, default: null },           // Error Code from gateway
  errorMessage: { type: String, default: null },        // Error description
  transactionType: { type: String },                    // ORDER, REFUND, etc.
  merchantId: { type: String },                         // Optional merchant identifier

  meta: { type: mongoose.Schema.Types.Mixed },          // Full gateway response / extra data

  file: {
    data: Buffer,
    contentType: String,
    fileName: String
  },

  insertdate: { type: Date, default: Date.now }         // Record insertion time
}, {
  timestamps: true                                       // Adds createdAt and updatedAt
});

module.exports = mongoose.model("TransactionLog", transactionLogSchema, "transaction_log");
