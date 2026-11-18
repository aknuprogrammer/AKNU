const mongoose = require("mongoose");

const seatingArrangementSchema = new mongoose.Schema(
  {
    // Examination Center Reference
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExaminationCenter",
      required: true,
      index: true,
    },
    centerName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    centerCode: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },

    // Student Information
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    rollNumber: {
      type: String,
      trim: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    firstName: {
      type: String,
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    semester: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },

    // Seating Information
    roomNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    seatNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    scriptCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
      maxlength: 100,
    },

    // College Information
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
    },
    collegeName: {
      type: String,
      trim: true,
    },
    collegeCode: {
      type: String,
      trim: true,
      uppercase: true,
    },

    // Payment Information
    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
      default: "PENDING",
    },
    transactionId: {
      type: String,
      trim: true,
    },

    // Status
    status: {
      type: String,
      enum: ["Active", "Inactive", "Cancelled"],
      default: "Active",
      index: true,
    },

    // QR Code Data
    qrCodeData: {
      type: String,
      trim: true,
      default: "",
    },
    // QR Code Image (Base64 encoded)
    qrCodeImage: {
      type: String,
      default: "",
    },

    // Generation Metadata
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
seatingArrangementSchema.index({ centerId: 1, status: 1 });
seatingArrangementSchema.index({ registrationNumber: 1, centerId: 1 });
seatingArrangementSchema.index({ roomNumber: 1, seatNumber: 1 });
seatingArrangementSchema.index({ generatedAt: -1 });

// Compound index for unique seating per center
seatingArrangementSchema.index(
  { centerId: 1, roomNumber: 1, seatNumber: 1 },
  { unique: true }
);

// Pre-save hook to update updatedAt
seatingArrangementSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.SeatingArrangement) {
  delete mongoose.models.SeatingArrangement;
}

module.exports = mongoose.model("SeatingArrangement", seatingArrangementSchema);

