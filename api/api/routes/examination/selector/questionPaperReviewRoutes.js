const express = require("express");
const {
  getQuestionPaperReviews,
  getQuestionPaperReviewById,
  getReviewsByQuestionPaper,
  getLatestReview,
  createQuestionPaperReview,
  updateQuestionPaperReview,
  deleteQuestionPaperReview,
} = require("../../../controllers/examination/selector/questionPaperReviewController");

const router = express.Router();

// GET routes (specific routes before :id)
router.get("/question-paper/:questionPaperId/latest", getLatestReview);
router.get("/question-paper/:questionPaperId", getReviewsByQuestionPaper);
router.get("/", getQuestionPaperReviews);
router.get("/:id", getQuestionPaperReviewById);

// POST routes
router.post("/", createQuestionPaperReview);

// PUT routes
router.put("/:id", updateQuestionPaperReview);

// DELETE routes
router.delete("/:id", deleteQuestionPaperReview);

module.exports = router;
