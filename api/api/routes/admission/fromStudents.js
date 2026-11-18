const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  updateSelectionStatus,
  getStudentDocument,
  getStudentsWithPayments,
  getStudentByHallTicket,
  getStudentsByCollege,
  updateStudentByHallTicket,
  getStudentByRegistrationNumber,
  getStudentsByFilters,
  getStudentsByHallTicketRange,
  addDocumentsByRegistrationNumber,
  acknowledgeDocuments,
  getAcknowledgedStudents,
  updateDocumentAcknowledgment,
  revokeDocumentAcknowledgment,
  updateDocumentsReceived,
} = require("../../controllers/admission/FromStudents");

// Multer setup for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// CRUD routes
router.post("/", upload.any(), createStudent); // handle file uploads
router.get("/", getStudents);
router.get("/getAll", getStudentsWithPayments);

// Specific routes must come before generic :id route
router.get("/by-filters", getStudentsByFilters);
router.get("/registration/:registrationNumber", getStudentByRegistrationNumber);
router.get("/hallTicket/:hallTicketNo", getStudentByHallTicket);
router.get("/college/:collegeCode", getStudentsByCollege);
router.get("/hall-ticket-range", getStudentsByHallTicketRange);
router.put("/registration/:registrationNumber/documents", upload.any(), addDocumentsByRegistrationNumber);
router.post("/documents/update-received", updateDocumentsReceived);
router.post("/documents/acknowledge", acknowledgeDocuments);
router.get("/documents/acknowledged", getAcknowledgedStudents);
router.put("/documents/acknowledgment/:acknowledgmentId", updateDocumentAcknowledgment);
router.put("/documents/acknowledgment/:acknowledgmentId/revoke", revokeDocumentAcknowledgment);
router.get("/:studentId/document/:docId", getStudentDocument);

// Generic routes
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.put(
  "/hallticket/:hallTicketNo",
  upload.any(),
  updateStudentByHallTicket
);

// Update selection status
router.patch("/:id/status", updateSelectionStatus);

module.exports = router;
