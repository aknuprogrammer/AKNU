const mongoose = require("mongoose");

// Qualification Schema (embedded in qualifications array)
const QualificationSchema = new mongoose.Schema(
  {
    collegeName: { type: String, required: true, trim: true },
    passoutYear: { type: String, required: true, trim: true },
    stream: { type: String, required: true, trim: true },
    presentAge: { type: Number },
    specialization: { type: String, trim: true },
    rollNumber: { type: String, trim: true },
  },
  { _id: false }
);

// Employee Registration Schema
const EmployeeRegistrationSchema = new mongoose.Schema(
  {
    // Employee ID (auto-generated)
    employeeId: { type: String, unique: true, sparse: true, trim: true },

    // Personal Information
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "male", "female", "other"],
      required: true,
      set: (v) => {
        // Normalize to capitalize first letter
        if (v) {
          return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
        }
        return v;
      },
    },
    dob: { type: Date, required: true },
    contactNumber: { type: String, required: true, trim: true },
    alternativeNumber: { type: String, trim: true },
    gmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    aadharNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{12}$/, "Aadhar number must be 12 digits"],
    },
    photo: { type: Buffer },
    photoContentType: { type: String },

    // Parent Information
    fatherName: { type: String, required: true, trim: true },
    fatherPhoneNumber: { type: String, required: true, trim: true },
    motherName: { type: String, required: true, trim: true },
    motherPhoneNumber: { type: String, required: true, trim: true },

    // Current Address
    currentAddressLine1: { type: String, required: true, trim: true },
    currentAddressLine2: { type: String, trim: true },
    currentCity: { type: String, required: true, trim: true },
    currentState: { type: String, required: true, trim: true },
    currentPincode: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{6}$/, "Pincode must be 6 digits"],
    },

    // Permanent Address
    permanentAddressLine1: { type: String, required: true, trim: true },
    permanentAddressLine2: { type: String, trim: true },
    permanentCity: { type: String, required: true, trim: true },
    permanentState: { type: String, required: true, trim: true },
    permanentPincode: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{6}$/, "Pincode must be 6 digits"],
    },

    // Qualifications (stored as array, can be stringified from client)
    qualifications: [QualificationSchema],

    // Experience Details
    experienceCollegeName: { type: String, trim: true },
    experience: { type: String, trim: true },
    location: { type: String, trim: true },
    domain: { type: String, trim: true },
    skills: { type: String, trim: true },

    // Job Details
    jobTitle: { type: String, trim: true },
    jobRole: { type: String, trim: true },
    joiningDate: { type: Date },
    department: { type: String, trim: true },

    // Signature
    signature: { type: Buffer },
    signatureContentType: { type: String },

    // Bank Details
    accountNumber: { type: String, trim: true },
    ifscCode: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "IFSC code must be valid format"],
    },
    bankName: { type: String, trim: true },
    branchName: { type: String, trim: true },
    accountHolderName: { type: String, trim: true },
    panCardNumber: {
      type: String,
      trim: true,
      uppercase: true,
      match: [
        /^[A-Z]{5}\d{4}[A-Z]{1}$/,
        "PAN card number must be valid format",
      ],
    },

    // Documents
    document10th: { type: Buffer },
    document10thContentType: { type: String },
    documentInter: { type: Buffer },
    documentInterContentType: { type: String },
    documentGraduation: { type: Buffer },
    documentGraduationContentType: { type: String },
    documentPostGraduation: { type: Buffer },
    documentPostGraduationContentType: { type: String },
    documentPhd: { type: Buffer },
    documentPhdContentType: { type: String },
    documentAadharCard: { type: Buffer },
    documentAadharCardContentType: { type: String },
    documentPanCard: { type: Buffer },
    documentPanCardContentType: { type: String },
    documentBankDetails: { type: Buffer },
    documentBankDetailsContentType: { type: String },
    documentResume: { type: Buffer },
    documentResumeContentType: { type: String },
    documentOtherCertificates: { type: Buffer },
    documentOtherCertificatesContentType: { type: String },
    documentAppointment: { type: Buffer },
    documentAppointmentContentType: { type: String },

    // Reference to User (for credentials)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },

    // Declaration
    declaration: {
      type: Boolean,
      default: false,
    },

    // Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "resigned"],
      default: "pending",
    },

    // System Fields
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes for better query performance
// Note: employeeId, gmail, and aadharNumber already have indexes from unique: true
EmployeeRegistrationSchema.index({ contactNumber: 1 });
EmployeeRegistrationSchema.index({ status: 1 });
EmployeeRegistrationSchema.index({ department: 1 });
EmployeeRegistrationSchema.index({ userId: 1 });
// Compound indexes for common queries
EmployeeRegistrationSchema.index({ status: 1, department: 1 });
EmployeeRegistrationSchema.index({ employeeId: 1, status: 1 });

module.exports =
  mongoose.models.EmployeeRegistration ||
  mongoose.model(
    "EmployeeRegistration",
    EmployeeRegistrationSchema,
    "employee_registrations"
  );
