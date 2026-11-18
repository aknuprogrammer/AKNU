const mongoose = require("mongoose");

const examFeeSchema = new mongoose.Schema({
  registrationNumber: String,
  studentName: String,
  course: String,
  year: String,
  semester: String,
  examType: String,
  subjectCount: Number,
  feePerSubject: Number,
  totalFee: Number,
  remarks: String,
}, { timestamps: true });

const hostelFeeSchema = new mongoose.Schema({
  // Student fields
  studentName: String,
  registrationNumber: String,
  course: String,
  yearSemester: String,
  // Staff fields
  employeeId: String,
  employeeName: String,
  department: String,
  // Common fields
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel" },
  hostelName: String,
  floorId: { type: mongoose.Schema.Types.ObjectId, ref: "Floor" },
  floorNumber: Number,
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  roomNumber: String,
  bedId: { type: mongoose.Schema.Types.ObjectId, ref: "Bed" },
  bedNumber: String,
  roomType: String,
  joiningDate: String,
  duration: Number,
  feePerMonth: Number,
  totalFee: Number,
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  paymentStatus: { type: String, enum: ["paid", "not_paid", "partial"], default: "not_paid" },
  paymentDate: String,
  paymentReference: String,
  remarks: String,
  // Type field to distinguish between student and staff
  applicationType: { type: String, enum: ["student", "staff"], default: "student" },
}, { timestamps: true });

const sportsFeeSchema = new mongoose.Schema({
  collegeCode: String,
  collegeName: String,
  academicYear: String,
  totalStudents: Number,
  paidStudents: Number,
  pendingStudents: Number,
  feePerStudent: Number,
  totalFee: Number,
  remarks: String,
}, { timestamps: true });

const affiliationFeeSchema = new mongoose.Schema({
  collegeCode: String,
  collegeName: String,
  course: String,
  academicYear: String,
  totalStudents: Number,
  paidStudents: Number,
  pendingStudents: Number,
  feePerStudent: Number,
  totalFee: Number,
  remarks: String,
}, { timestamps: true });

const admissionFormSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  countryCode: String,
  phone: String,
  fatherName: String,
  aadhaar: String,
  gender: String,
  dob: String,
  qualification: String,
  preferredCourse: String,
  preferredCampus: String,
  message: String,
}, { timestamps: true });

module.exports = {
  ExamFee: mongoose.model("ExamFee", examFeeSchema),
  HostelFee: mongoose.model("HostelFee", hostelFeeSchema),
  SportsFee: mongoose.model("SportsFee", sportsFeeSchema),
  AffiliationFee: mongoose.model("AffiliationFee", affiliationFeeSchema),
  AdmissionForm: mongoose.model("AdmissionForm", admissionFormSchema),
};

