const express = require("express");
const {
  getQuestionPapers,
  getQuestionPaperById,
  createQuestionPaper,
  updateQuestionPaper,
  deleteQuestionPaper,
  submitQuestionPaper,
  approveQuestionPaper,
  rejectQuestionPaper,
  getQuestionPapersBySubject,
  getQuestionPapersByAcademicYear,
  getQuestionPapersByStatus,
  getQuestionPaperBySubjectCode,
  uploadQuestionPaperPdf,
  downloadQuestionPaperPdf,
  viewQuestionPaperPdf,
  deleteQuestionPaperPdf,
  upload,
} = require("../../../controllers/examination/selector/questionPaperController");

const router = express.Router();

// GET routes (specific routes before :id)
router.get("/subject/:subjectId", getQuestionPapersBySubject);
router.get("/subject-code/:subjectCode", getQuestionPaperBySubjectCode);
router.get("/academic-year/:academicYearId", getQuestionPapersByAcademicYear);
router.get("/status/:status", getQuestionPapersByStatus);
router.get("/:id/download-pdf", downloadQuestionPaperPdf);
router.get("/:id/view-pdf", viewQuestionPaperPdf);
router.get("/", getQuestionPapers);
router.get("/:id", getQuestionPaperById);

// POST routes
router.post("/", createQuestionPaper);
router.post("/:id/upload-pdf", upload.single("pdf"), uploadQuestionPaperPdf);

// PUT routes
router.put("/:id", updateQuestionPaper);
router.put("/:id/submit", submitQuestionPaper);
router.put("/:id/approve", approveQuestionPaper);
router.put("/:id/reject", rejectQuestionPaper);

// DELETE routes
router.delete("/:id/delete-pdf", deleteQuestionPaperPdf);
router.delete("/:id", deleteQuestionPaper);

module.exports = router;

