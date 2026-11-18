const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  selectedFees: [
    {
      feeId: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String },
      amount: { type: Number, required: true },
    },
  ],
  paymentMethod: {
    type: String,
    enum: ["upi", "dd", "challan", "date"],
    required: true,
  }, // added challan
  paymentDetails: {
    upiTxnId: { type: String },
    challanNo: { type: String }, // added challan number field
    ddNumber: { type: String },
    bankName: { type: String },
    branch: { type: String },
    date: { type: String },
  },
  referenceNumber: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.admission_payment ||
  mongoose.model("admission_payment", paymentSchema);
