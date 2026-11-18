const mongoose = require('mongoose');

// __PENDING__

// Alumni Event Add Schema
const alumniEventAddSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  date: { type: Date },
  time: { type: String },
  venue: { type: String },
  organizer: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  // banner: { type: Buffer }, // optional image
  // bannerContentType: String, // MIME type for banner
  eventType: { type: String, enum: ["free", "paid"], default: "free" },
  amount: { type: Number }, // optional, only needed if eventType = "paid"
  adminApprovedStatus: {type: String, enum: ["PENDING","APPROVED","REJECTED"], default: () => "PENDING"},
}, { timestamps: true, collection: "AlumniEventAddModel" });

const AlumniEventAddModel = mongoose.model('AlumniEventAddModel', alumniEventAddSchema);

// Alumni Donation Schema
const alumniDonationSchema = new mongoose.Schema({
  donorName: String,
  donorEmail: String,
  donorPhone: String,
  amount: Number,
  currency: String,
  purpose: String, // e.g. "Scholarship Fund", "Infrastructure"
  paymentMethod: String, // e.g. "Credit Card", "UPI", "Bank Transfer"
  transactionId: String,
  donationDate: { type: Date, default: Date.now },
  message: String,
}, { timestamps: true, collection: "AlumniDonationModel" });

const AlumniDonationModel = mongoose.model('AlumniDonationModel', alumniDonationSchema);

const ExistingAlumniSchema = new mongoose.Schema({
  reg_no: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
  },
}, { collection: "ExistingAlumniModel" });

const ExistingAlumniModel = mongoose.model("ExistingAlumniModel", ExistingAlumniSchema);

module.exports = { AlumniEventAddModel, AlumniDonationModel, ExistingAlumniModel };
