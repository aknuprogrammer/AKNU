const mongoose = require("mongoose");

// Qualification Schema (embedded in qualifications array)
const QualificationSchema = new mongoose.Schema(
  {
    collegeName: { type: String, required: true, trim: true },
    passoutYear: { type: String, required: true, trim: true },
    specialization: { type: String, trim: true },
    rollNumber: { type: String, trim: true },
    education: { type: String, trim: true }, // e.g., "Bachelor of Technology"
    percentage: { type: String, trim: true }, // e.g., "85.5"
  },
  { _id: false }
);

// Experience Schema (embedded in experiences array)
const ExperienceSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    location: { type: String, trim: true },
    domain: { type: String, trim: true },
  },
  { _id: false }
);

// Skill Schema (embedded in skills array)
const SkillSchema = new mongoose.Schema(
  {
    skillName: { type: String, required: true, trim: true },
    experience: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

// Additional Document Schema (embedded in additionalDocuments array)
const AdditionalDocumentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    file: { type: Buffer },
    fileContentType: { type: String },
    fileName: { type: String, trim: true },
    fileSize: { type: Number },
  },
  { _id: false }
);

// Employee Onboarding Schema
const OnboardingSchema = new mongoose.Schema(
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
      sparse: true, // Allow multiple null values
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    aadharNumber: {
      type: String,
      required: true,
      unique: true,
      sparse: true, // Allow multiple null values
      trim: true,
      match: [/^\d{12}$/, "Aadhar number must be 12 digits"],
    },
    photo: { type: Buffer },
    photoContentType: { type: String },
    photoName: { type: String, trim: true },
    photoSize: { type: Number },

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

    // Qualifications (stored as array)
    qualifications: [QualificationSchema],

    // Experience Details (stored as array)
    experiences: [ExperienceSchema],

    // Skills (stored as array)
    skills: [SkillSchema],

    // Additional Documents (stored as array)
    additionalDocuments: [AdditionalDocumentSchema],

    // Job Details
    jobTitle: { type: String, trim: true },
    jobRole: { type: String, trim: true },
    joiningDate: { type: Date },
    department: { type: String, trim: true },

    // Signature
    signature: { type: Buffer },
    signatureContentType: { type: String },
    signatureName: { type: String, trim: true },
    signatureSize: { type: Number },

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
    accountType: { type: String, trim: true },
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


    // Reference to User collection (mapped by employeeId)
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

    // Onboarding Status (keeping this field name for onboarding context)
    onboardingStatus: {
      type: String,
      enum: ["pending", "in_progress", "completed", "rejected"],
      default: "pending",
    },
    onboardingStage: {
      type: String,
      enum: [
        "document_verification",
        "background_check",
        "offer_acceptance",
        "document_submission",
        "orientation",
        "completed",
      ],
      default: "document_verification",
    },

    // System Fields
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes for better query performance
// Note: employeeId, gmail, and aadharNumber already have indexes from unique: true
OnboardingSchema.index({ contactNumber: 1 });
OnboardingSchema.index({ onboardingStatus: 1 });
OnboardingSchema.index({ department: 1 });
OnboardingSchema.index({ userId: 1 });
// Compound indexes for common queries
OnboardingSchema.index({ onboardingStatus: 1, department: 1 });
OnboardingSchema.index({ employeeId: 1, onboardingStatus: 1 });
OnboardingSchema.index({ employeeId: 1, userId: 1 }); // Compound index for employeeId-userId lookup

module.exports =
  mongoose.models.Onboarding ||
  mongoose.model("Onboarding", OnboardingSchema, "employee_onboarding");
