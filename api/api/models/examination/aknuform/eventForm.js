const mongoose = require("mongoose");

const eventFormSchema = new mongoose.Schema({
  eventTitle: { type: String, required: true },
  name: { type: String, required: true },
  decision: { type: String, default: "pending" },
  location: { type: String, required: true },
  occupation: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  description: { type: String },

  eventCreatedBy: { type: String, enum: ["GENERAL", "ALUMNI"], default: "ALUMNI" },
  paymentAmountRs: { type: Number },

  paymentStatus: { type: String, enum: ["PENDING","SUCCESS","FAILED"], default: "PENDING" },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("eventsForm", eventFormSchema, "eventForm");
