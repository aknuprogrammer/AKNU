const mongoose = require("mongoose");

// Document Schema
const DocumentSchema = new mongoose.Schema(
  {
    docId: { type: String, required: false },
    name: { type: String, trim: true },
    file: { type: Buffer, required: false },
    fileType: { type: String },
    submitted: { type: String, enum: ["true", "no"], default: "no" },
    verified: {
      type: String,
      enum: ["verified", "not_verified"],
      default: "not_verified",
    },
    comment: { type: String, trim: true },
  },
  { _id: false }
);

// Academic Schema
const AcademicSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    collegeName: { type: String, required: true },
    qualification: { type: String, required: true },
    specialization: { type: String },
    completionYear: { type: String, required: true },
    result: { type: String, required: true },
    achievements: { type: String },
  },
  { _id: false }
);

// Correction Schema
const CorrectionSchema = new mongoose.Schema(
  {
    reason: { type: String, required: true, trim: true },
    flag: { type: String, enum: ["yes", "no"], default: "no" },
  },
  { _id: false }
);

const StudentSchema = new mongoose.Schema({
  hallTicketNo: String,
  admitCardId: String,
  rank: String,
  seatCategory: String,
  phase: String,
  seatCategorySPL: String,

  firstName: String,
  middleName: String,
  lastName: String,
  fatherName: String,
  motherName: String,
  fatherEmail: String,
  motherEmail: String,
  fatherOccupation: String,
  fatherIncome: String,
  motherOccupation: String,
  motherIncome: String,
  dob: String,
  gender: String,
  nationality: String,
  caste: String,
  religion: String,
  aadharNumber: String,
  aparId: String,

  personalMark1: String,
  personalMark2: String,

  email: String,
  phone: String,
  altPhone: String,

  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  pincode: String,

  academicRecords: [AcademicSchema],

  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
  },
  // Course-Stream-Semester mapping reference (replaces individual course, semester, stream references)
  courseStreamMappingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CourseStreamMapping",
    index: true,
  },

  documents: [DocumentSchema],

  hasDisability: String,
  disabilityCertificate: Buffer,
  hasScholarship: String,
  requiresReimbursement: String,

  requiresHostel: String,
  requiresTransport: String,

  referenceNumber: { type: String, required: true, unique: true },

  // Examination application fields
  registrationNumber: { type: String, trim: true, index: true },

  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear", // References AcademicYear collection (batches)
    index: true,
  },
  // Alternative batch field (kept for backward compatibility)

  status: {
    type: String,
    enum: ["pending", "Admitted", "not_selected"],
    default: "pending",
  },

  // Corrections array
  corrections: { type: [CorrectionSchema], default: [] },
});

module.exports = mongoose.model("Student", StudentSchema);
