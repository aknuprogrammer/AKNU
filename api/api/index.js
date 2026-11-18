require("dotenv").config();
const express = require("express");
const performanceRoutes = require("./routes/performance/performanceRoutes");
const mongoose = require("mongoose");

const cors = require("cors");
const multer = require("multer");
const notificationrouter = require("./routes/notificationsRoute");
const newsRoute = require("./routes/newsRoutes");
const eventRoute = require("./routes/eventsRoute");
const voiceRoute = require("./routes/voiceRoute");
const eventFormRouter = require("./routes/aknuform/eventForm");

const corsMiddleware = require("./middlewares/cors");
const certificateRoutes = require("./routes/aknuform/certificationRoute");

const alumniRoute = require("./routes/aknuform/alumniRoute");
const feedbackRoute = require("./routes/aknuform/feedbackRoute");
const addisomFormRouter = require("./routes/aknuform/admissionFormRouter");
const otprouter = require("./routes/chatwithus/otpRoute");
const chatrouter = require("./routes/chatwithus/chatWithUs");
const authenticationRouter = require("./routes/authentication/authenticationRoute");
const feesRouter = require("./routes/fees/feesFormRoute");
const admissionFeesRouter = require("./routes/fees/admissionFeesRoute");
const galleryRouter = require("./routes/galleryRoute");
// const ResultBatch = require("./models/ResultBatch");
const resultsRouter = require("./routes/results");
const adhocRoute = require("./routes/formUpload/newFormUpload");
const womenCellRoutes = require("./routes/womenCell");
const cdcComplaintRoutes = require("./routes/cdcComplaint");
const editionRoutes = require("./routes/nannayaVani");
const collegeRoutes = require("./routes/certificationFee/collegeRoutes");
const courseRoutes = require("./routes/certificationFee/courseRoutes");
const applicationPurposeRoutes = require("./routes/certificationFee/applicationPurposeRoutes");
const certificateFeeRoutes = require("./routes/certificationFee/certificateRoutes");

// const paymentRoutes = require("./routes/payments/paymentRoutes");
const formRoutes = require("./routes/certificationFee/formsRoute");
const letterRoutes = require("./routes/letterRoutes");
const pdfUpload = require("./routes/results/pdfUpload");
const fromStudents = require("./routes/admission/fromStudents");
const alumni_new_sub_router = require("./controllers/Alumni_Related.Controller_Router");

const colleges = require("./routes/admission/selector/collegeRoutes");
const courses = require("./routes/admission/selector/courseRoutes");
const mappingRoutes = require("./routes/admission/selector/collegeCourseMapping");
const otherFee = require("./routes/admission/selector/otherFees");
const admissionFeeRoutes = require("./routes/admission/selector/admissionFeeRoutes");
const ApscheAllotments = require("./routes/admission/selector/apscheAllotmentRoutes");
const certificateChecklistRoutes = require("./routes/admission/selector/certificateChecklistRoutes");
const paymentsRoutes = require("./routes/admission/payments");
const datePickerRoutes = require("./routes/admission/selector/datePicker");
const admissionCommunicationRoutes = require("./routes/admission/selector/communications");
const feePendingCommunicationRoutes = require("./routes/admission/selector/feePendingCommunicationRoutes");
const examTimetableCommunicationRoutes = require("./routes/admission/selector/examTimetableCommunicationRoutes");
const eventCommunicationRoutes = require("./routes/admission/selector/eventCommunicationRoutes");
const absentNotificationRoutes = require("./routes/admission/selector/absentNotificationRoutes");

const examinationCollegeTypeRoutes = require("./routes/examination/selector/collegeTypeRoutes");
const examinationCollegeCategoryRoutes = require("./routes/examination/selector/collegeCategoryRoutes");
const examinationCollegeOtherCategoryRoutes = require("./routes/examination/selector/collegeOtherCategoryRoutes");
const examinationExamTypeRoutes = require("./routes/examination/selector/examTypeRoutes");
const examinationExamCategoryRoutes = require("./routes/examination/selector/examCategoryRoutes");
const examinationAcademicYearRoutes = require("./routes/examination/selector/academicYearRoutes");
const examinationSemesterRoutes = require("./routes/examination/selector/semesterRoutes");
const examinationStreamRoutes = require("./routes/examination/selector/streamRoutes");
const examinationSubjectRoutes = require("./routes/examination/selector/subjectRoutes");
const examinationStreamSubjectMappingRoutes = require("./routes/examination/selector/streamSubjectMappingRoutes");
const examinationProfessorRoutes = require("./routes/examination/selector/professorRoutes");
const examinationCenterRoutes = require("./routes/examination/selector/examinationCenterRoutes");
const examinationCenterCollegeMappingRoutes = require("./routes/examination/selector/examCenterCollegeMappingRoutes");
const examinationInvigilatorRoutes = require("./routes/examination/selector/invigilatorRoutes");
const examinationTimetableEntryRoutes = require("./routes/examination/selector/timetableEntryRoutes");
const examinationCourseStreamMappingRoutes = require("./routes/examination/selector/courseStreamMappingRoutes");
const examinationCourseAcademicYearMappingRoutes = require("./routes/examination/selector/courseAcademicYearMappingRoutes");
const examinationQuestionPaperRoutes = require("./routes/examination/selector/questionPaperRoutes");
const examinationQuestionPaperReviewRoutes = require("./routes/examination/selector/questionPaperReviewRoutes");
const examinationQuestionPaperExamCenterMappingRoutes = require("./routes/examination/selector/questionPaperExamCenterMappingRoutes");
const examinationPaymentRoutes = require("./routes/examination/examinationPaymentRoutes");
const revaluationPaymentRoutes = require("./routes/examination/revaluationPaymentRoutes");
const revaluationRequestRoutes = require("./routes/examination/revaluation/revaluationRequestRoutes");
const examinationInternalExamSetupRoutes = require("./routes/examination/internalExamSetupRoutes");
const examinationInternalMarksRoutes = require("./routes/examination/internalMarksRoutes");

const FacultyTrackingRoute = require("./routes/FacultyTracking");

const departmentRoute = require("./routes/departmentRoute");

const iumsRoute = require("./routes/Iums/UniversityRoutes");
const fieldTrackerRoute = require("./routes/fieldTrackerRoute");
const employeeOnboardingRoute = require("./routes/employee/onboarding");
const employeeLeaveRoute = require("./routes/employee/leave");
const employeePaySlipRoute = require("./routes/employee/paySlip");
const employeeRegistrationRoute = require("./routes/employee/employeeRegistration");
const employeeQueryRoute = require("./routes/employee/employeeQuery");
const employeeBillRoute = require("./routes/employee/employeeBill");
const employeeResignationRoute = require("./routes/employee/employeeResignation");
const seedDataRoutes = require("./routes/seedDataRoutes");
const hiringRoutes = require("./routes/hiring/hiringRoutes");
const applicationRoutes = require("./routes/hiring/applicationRoutes");

const { submitIdea } = require("./controllers/ShareIdeaController");

const app = express();

// 1. Move CORS to the very top to ensure it covers body-parser errors
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://dev.admin.aknu.edu.in",
      "https://admin.aknu.edu.in",
      "https://aknu.edu.in",
      "http://localhost:5177",
      "https://dev.aknu.edu.in",
    ],
    credentials: true,
  }),
);

// 2. High Payload Limits for general routes (Unlimited support)
app.use(express.json({ limit: "1000mb" }));
app.use(express.urlencoded({ extended: true, limit: "1000mb" }));

// 110: // If you use multer for file uploads, keep as-is
const upload = multer({ storage: multer.memoryStorage() });

// app.use(corsMiddleware)

// MongoDB connection with improved timeout and retry settings
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB, {
      dbName: process.env.MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout for server selection
      socketTimeoutMS: 45000, // 45 seconds timeout for socket operations
      connectTimeoutMS: 10000, // 10 seconds timeout for initial connection
      maxPoolSize: 10, // Maximum number of connections in the pool
      retryWrites: true, // Retry write operations on network errors
      retryReads: true, // Retry read operations on network errors
    });
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    console.error("Error details:", {
      name: err.name,
      code: err.code,
      errorLabelSet: err.errorLabelSet,
    });
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// MongoDB connection event listeners
mongoose.connection.on("connected", () => {
  console.log(mongoose.connection.name);
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("Mongoose disconnected from MongoDB");
});

// Handle application termination
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to application termination");
  process.exit(0);
});

// Initialize connection
connectDB();

// Redundant body-parsers removed (already initialized at the top with limits)


app.use("/api/uploads", express.static("api/uploads"));

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Testing",
    version: "1.0.0",
    endpoints: {
      base: "/api",
      docs: "API endpoints are available under /api/*",
    },
  });
});

app.use("/api/login", require("./routes/auth/login"));
app.use("/api/get-documents", require("./routes/formUpload/getDocuments"));
app.use("/api/notifications", notificationrouter);
app.use("/api/news", newsRoute);
app.use("/api/event", eventRoute);
app.use("/api/voices-at-aknu", voiceRoute);
app.use("/api/upload", require("./routes/formUpload/upload"));
app.use("/api/info", upload.any(), require("./routes/important_information"));
app.use("/api/syllabus", upload.any(), require("./routes/website/syllabus"));
app.use("/api/website/department-seminars", require("./routes/website/departmentSeminarRoutes"));
app.use("/api/women-cell", womenCellRoutes);
app.use("/api/cdc-complaint", cdcComplaintRoutes);

app.use("/api/form-upload", eventFormRouter);
app.use("/api/admission-form", addisomFormRouter);
app.use("/api/certification-form", certificateRoutes);
app.use("/api/alumni-form", alumniRoute);
app.use("/api/alumni", alumni_new_sub_router);
app.use("/api/feedback-form", feedbackRoute);
app.use("/api/otp", otprouter);
app.use("/api/chat-with-us", chatrouter);
app.use("/api/authentication", authenticationRouter);
app.use("/api/fees", feesRouter);
app.use("/api/carousel", require("./routes/carouselRoute"));
app.use("/api/important-dates", require("./routes/important_datesRoute"));
app.use("/api/admission-fees", admissionFeesRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/results", resultsRouter);
app.use("/api/adhoc-upload", adhocRoute);

app.use("/api/editions", editionRoutes);

app.use("/api/colleges", collegeRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/application-purposes", applicationPurposeRoutes);

app.use("/api/certificate", certificateFeeRoutes);

// app.use("/api/payment", paymentRoutes);
app.use("/api", formRoutes);
app.use("/api/letters", letterRoutes);
app.use("/api/pdfUpload", pdfUpload);
app.use("/api/pdfUpload", pdfUpload);
app.use("/api/students", fromStudents);
app.use("/api/students", require("./routes/admission/addStudentEmailsRoute"));
app.use(
  "/api/student-attendance",
  require("./routes/admission/studentAttendanceRoutes"),
);

app.use("/api/colleges_data", colleges);
app.use("/api/courses_data", courses);
app.use("/api/mappings", mappingRoutes);
app.use("/api/apsche_allotements", ApscheAllotments);
app.use("/api/certificate-checklist", certificateChecklistRoutes);
app.use("/api/admission_fees", admissionFeeRoutes);
app.use("/api/other_fee", otherFee);
app.use("/api/payments", paymentsRoutes);

// in your app.js (or server file)
app.use("/api/date-picker", datePickerRoutes);
app.use("/api/admission-communications", admissionCommunicationRoutes);
app.use("/api/fee-pending-communications", feePendingCommunicationRoutes);
app.use("/api/exam-timetable-communications", examTimetableCommunicationRoutes);
app.use("/api/event-communications", eventCommunicationRoutes);
app.use("/api/absent-notifications", absentNotificationRoutes);

app.use("/api/examination/college-types", examinationCollegeTypeRoutes);
app.use(
  "/api/examination/college-categories",
  examinationCollegeCategoryRoutes,
);
app.use(
  "/api/examination/college-other-categories",
  examinationCollegeOtherCategoryRoutes,
);
app.use("/api/examination/exam-types", examinationExamTypeRoutes);
app.use("/api/examination/exam-categories", examinationExamCategoryRoutes);
app.use("/api/examination/academic-years", examinationAcademicYearRoutes);
app.use("/api/examination/semesters", examinationSemesterRoutes);
app.use("/api/examination/streams", examinationStreamRoutes);
app.use("/api/examination/subjects", examinationSubjectRoutes);
app.use(
  "/api/examination/stream-subject-mappings",
  examinationStreamSubjectMappingRoutes,
);
app.use("/api/examination/professors", examinationProfessorRoutes);
app.use("/api/examination/examination-centers", examinationCenterRoutes);
app.use(
  "/api/examination/exam-center-college-mappings",
  examinationCenterCollegeMappingRoutes,
);
app.use("/api/examination/invigilators", examinationInvigilatorRoutes);
app.use("/api/examination/timetable-entries", examinationTimetableEntryRoutes);
app.use(
  "/api/examination/course-stream-mappings",
  examinationCourseStreamMappingRoutes,
);
app.use(
  "/api/examination/course-academic-year-mappings",
  examinationCourseAcademicYearMappingRoutes,
);
app.use("/api/examination/question-papers", examinationQuestionPaperRoutes);
app.use(
  "/api/examination/question-paper-reviews",
  examinationQuestionPaperReviewRoutes,
);
app.use(
  "/api/examination/question-paper-exam-center-mappings",
  examinationQuestionPaperExamCenterMappingRoutes,
);
app.use("/api/examination-application", examinationPaymentRoutes);
app.use("/api/revaluation-application", revaluationPaymentRoutes);
app.use("/api/revaluation", revaluationRequestRoutes);
app.use(
  "/api/examination/internal-exam-setups",
  examinationInternalExamSetupRoutes,
);
app.use("/api/examination/internal-marks", examinationInternalMarksRoutes);

const bundleRoutes = require("./routes/examination/postExamination/bundleRoutes");
const scriptRoutes = require("./routes/examination/postExamination/scriptRoutes");
const evaluatorAllocationRoutes = require("./routes/examination/postExamination/evaluatorAllocationRoutes");
const evaluatorRoutes = require("./routes/examination/postExamination/evaluatorRoutes");
app.use("/api/examination/bundles", bundleRoutes);
app.use("/api/examination/scripts", scriptRoutes);
app.use("/api/examination/evaluator-allocations", evaluatorAllocationRoutes);
app.use("/api/examination/evaluators", evaluatorRoutes);

const examAttendanceRoutes = require("./routes/examination/examAttendanceRoutes");
const malpracticeReportRoutes = require("./routes/examination/malpracticeReportRoutes");
app.use("/api/examination/exam-attendance", examAttendanceRoutes);
app.use("/api/examination/malpractice-reports", malpracticeReportRoutes);
const jumblingCentersRoutes = require("./routes/examination/jumblingCentersRoutes");
app.use("/api/examination/seating-arrangements", jumblingCentersRoutes);

const combinedResultRoutes = require("./routes/examination/combinedResultRoutes");
app.use("/api/examination/combined-results", combinedResultRoutes);

app.use("/api/faculty-tracking", FacultyTrackingRoute);
app.use("/api/field-tracking", fieldTrackerRoute);

app.use("/api/departments", departmentRoute);

app.use("/api/iums", iumsRoute);

app.post("/api/submit-idea", upload.single("idea"), submitIdea);
app.use("/api/field-tracker", fieldTrackerRoute);

app.use("/api/employee/registration", employeeRegistrationRoute);
app.use("/api/employee/onboarding", employeeOnboardingRoute);
app.use("/api/employee/leave", employeeLeaveRoute);
app.use("/api/employee/query", employeeQueryRoute);
app.use("/api/employee/bill", employeeBillRoute);
app.use("/api/employee/resignation", employeeResignationRoute);
app.use("/api/employee", employeePaySlipRoute);

const timesheetRoutes = require("./routes/timesheet/timesheetRoutes");
app.use("/api/timesheet", timesheetRoutes);

// IMPORTANT: Register application routes BEFORE hiring routes to avoid route conflicts
// Otherwise /api/hiring/applications will match /api/hiring/:id route
app.use("/api/hiring/applications", applicationRoutes);
app.use("/api/hiring", hiringRoutes);
app.use(
  "/api/performance/upload",
  require("./routes/performance/uploadRoutes"),
);
app.use("/api/performance", performanceRoutes);

// Hostel Management Routes
const wardenRoutes = require("./routes/hostel/wardenRoutes");
const hostelRoutes = require("./routes/hostel/hostelRoutes");
const hostelTypeRoutes = require("./routes/hostel/hostelTypeRoutes");
const floorRoutes = require("./routes/hostel/floorRoutes");
const blockRoutes = require("./routes/hostel/blockRoutes");
const roomRoutes = require("./routes/hostel/roomRoutes");
const bedRoutes = require("./routes/hostel/bedRoutes");
const hostelEquipmentRoutes = require("./routes/hostel/equipmentRoutes");
app.use("/api/hostel/wardens", wardenRoutes);
app.use("/api/hostel/types", hostelTypeRoutes);
app.use("/api/hostel/floors", floorRoutes);
app.use("/api/hostel/blocks", blockRoutes);
app.use("/api/hostel/rooms", roomRoutes);
app.use("/api/hostel/beds", bedRoutes);
app.use("/api/hostel/equipment", hostelEquipmentRoutes);
app.use("/api/hostel/facilities", require("./routes/hostel/facilityRoutes"));
app.use(
  "/api/hostel/fee-structure",
  require("./routes/hostel/hostelFeeStructureRoutes"),
);
app.use("/api/hostel/attendance", require("./routes/hostel/attendanceRoutes"));
app.use("/api/hostel/leaves", require("./routes/hostel/leaveRoutes"));
app.use("/api/hostel/outpass", require("./routes/hostel/outPassRoutes"));
app.use("/api/hostel/mess", require("./routes/hostel/messRoutes"));
app.use("/api/hostel/visitors", require("./routes/hostel/visitorRoutes"));
app.use("/api/hostel", hostelRoutes);

// Labs routes
const labTypeRoutes = require("./routes/labs/labTypeRoutes");
const labRoutes = require("./routes/labs/labRoutes");
const equipmentCategoryRoutes = require("./routes/labs/equipmentCategoryRoutes");
const equipmentRoutes = require("./routes/labs/equipmentRoutes");
const consumableRoutes = require("./routes/labs/consumableRoutes");
const labScheduleRoutes = require("./routes/labs/labScheduleRoutes");
const labBookingRoutes = require("./routes/labs/labBookingRoutes");
const maintenanceIssueRoutes = require("./routes/labs/maintenanceIssueRoutes");
const maintenanceLogRoutes = require("./routes/labs/maintenanceLogRoutes");
const labInchargeRoutes = require("./routes/labs/labInchargeRoutes");
const labReportsRoutes = require("./routes/labs/labReportsRoutes");

app.use("/api/labs/lab-types", labTypeRoutes);
app.use("/api/labs/labs", labRoutes);
app.use("/api/labs/equipment-categories", equipmentCategoryRoutes);
app.use("/api/labs/equipment", equipmentRoutes);
app.use("/api/labs/consumables", consumableRoutes);
app.use("/api/labs/lab-schedules", labScheduleRoutes);
app.use("/api/labs/lab-bookings", labBookingRoutes);
app.use("/api/labs/maintenance-issues", maintenanceIssueRoutes);
app.use("/api/labs/maintenance-logs", maintenanceLogRoutes);
app.use("/api/labs/lab-incharges", labInchargeRoutes);
app.use("/api/labs/reports", labReportsRoutes);

// Seed data route (for development/testing)
app.use("/api/seed-data", seedDataRoutes);

// Library routes
const bookCategoryRoutes = require("./routes/library/bookCategoryRoutes");
const authorRoutes = require("./routes/library/authorRoutes");
const publisherRoutes = require("./routes/library/publisherRoutes");
const libraryInfoRoutes = require("./routes/library/libraryInfoRoutes");
const libraryRackRoutes = require("./routes/library/libraryRackRoutes");
const bookRoutes = require("./routes/library/bookRoutes");
const issuedBookRoutes = require("./routes/library/issuedBookRoutes");
const libraryRulesRoutes = require("./routes/library/libraryRulesRoutes");
app.use("/api/library/book-categories", bookCategoryRoutes);
app.use("/api/library/authors", authorRoutes);
app.use("/api/library/publishers", publisherRoutes);
app.use("/api/library/library-info", libraryInfoRoutes);
app.use("/api/library/racks", libraryRackRoutes);
app.use("/api/library/books", bookRoutes);
app.use("/api/library/issued-books", issuedBookRoutes);
app.use("/api/library/rules", libraryRulesRoutes);

// New Library Routes
const physicalInventoryRoutes = require("./routes/library/physicalInventoryRoutes");
const digitalResourceRoutes = require("./routes/library/digitalResourceRoutes");
app.use("/api/library/physical-inventory", physicalInventoryRoutes);
app.use("/api/library/digital-resources", digitalResourceRoutes);

// Student No-Due Route
const noDueRoutes = require("./routes/student/noDueRoutes");
app.use("/api/student/no-due", noDueRoutes);

// Transportation Routes
const driverRoutes = require("./routes/transportation/driverRoutes");
app.use("/api/transportation/drivers", driverRoutes);

const vehicleTypeRoutes = require("./routes/transportation/vehicleTypeRoutes");
app.use("/api/transportation/vehicle-types", vehicleTypeRoutes);

const vehicleRoutes = require("./routes/transportation/vehicleRoutes");
app.use("/api/transportation/vehicles", vehicleRoutes);

const driverMappingRoutes = require("./routes/transportation/driverMappingRoutes");
app.use("/api/transportation/driver-mappings", driverMappingRoutes);

const routeMappingRoutes = require("./routes/transportation/routeMappingRoutes");
app.use("/api/transportation/route-mappings", routeMappingRoutes);

const transportAssignmentRoutes = require("./routes/transportation/transportAssignmentRoutes");
app.use("/api/transportation/transport-assignments", transportAssignmentRoutes);

const routeRoutes = require("./routes/transportation/routeRoutes");
app.use("/api/transportation/routes", routeRoutes);

module.exports = app;
