const express = require("express");
const multer = require("multer");
const {
  getExamTimetableCommunications,
  createExamTimetableCommunication,
  getExamTimetableCommunicationById,
  deleteExamTimetableCommunication,
  getExamTimetablePdf, // Import new controller method
} = require("../../../controllers/admission/selector/examTimetableCommunicationController");

const router = express.Router();

// Memory storage for storing file in Buffer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get("/", getExamTimetableCommunications);
router.post("/", upload.single('timetableFile'), createExamTimetableCommunication);
router.get("/:id", getExamTimetableCommunicationById);
router.get("/:id/pdf", getExamTimetablePdf); // New route for serving PDF
router.delete("/:id", deleteExamTimetableCommunication);

module.exports = router;
