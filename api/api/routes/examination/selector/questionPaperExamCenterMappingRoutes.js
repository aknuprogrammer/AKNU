const express = require("express");
const {
  getQuestionPaperExamCenterMappings,
  getQuestionPaperExamCenterMappingById,
  createQuestionPaperExamCenterMapping,
  updateQuestionPaperExamCenterMapping,
  deleteQuestionPaperExamCenterMapping,
  restoreQuestionPaperExamCenterMapping,
  getMappingsByExamCenter,
  getMappingsByQuestionPaper,
} = require("../../../controllers/examination/selector/questionPaperExamCenterMappingController");

const router = express.Router();

// GET routes (specific routes before :id)
router.get("/exam-center/:examCenterId", getMappingsByExamCenter);
router.get("/question-paper/:questionPaperId", getMappingsByQuestionPaper);
router.get("/", getQuestionPaperExamCenterMappings);
router.get("/:id", getQuestionPaperExamCenterMappingById);

// POST routes
router.post("/", createQuestionPaperExamCenterMapping);

// PUT routes
router.put("/:id", updateQuestionPaperExamCenterMapping);
router.put("/:id/restore", restoreQuestionPaperExamCenterMapping);

// DELETE routes
router.delete("/:id", deleteQuestionPaperExamCenterMapping);

module.exports = router;

