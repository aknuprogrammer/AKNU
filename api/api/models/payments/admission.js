const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true,
  },

  // Razorpay identifiers
  razorpayPaymentId: { type: String, unique: true },
  razorpayOrderId: { type: String },
  razorpaySignature: { type: String },

  // Payment details
  amount: { type: Number },            // amount in smallest unit (paise)
  currency: { type: String },          // e.g. "INR"
  status: { type: String },            // e.g. "captured", "failed", "created"
  method: { type: String },            // e.g. "card", "netbanking", "upi"
  bank: { type: String },              // bank name if available
  vpa: { type: String },               // upi vpa if available
  card: {
    id: String,
    network: String,
    issuer_bank: String,
    last4: String,
  },
  bank_ifsc: { type: String },         // if you can extract IFSC, store it
  email: { type: String },
  contact: { type: String },
  description: { type: String },

  // mode of payment (human readable)
  mode: { type: String },

  // any notes / metadata
  notes: { type: mongoose.Schema.Types.Mixed },

  // raw response stored for audit/debugging
  rawResponse: { type: mongoose.Schema.Types.Mixed },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", PaymentSchema);
