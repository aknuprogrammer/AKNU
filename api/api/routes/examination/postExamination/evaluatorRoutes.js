const express = require("express");
const router = express.Router();
const authenticationMiddleware = require("../../../middlewares/authentication");
const {
  getAllEvaluators,
  getEvaluatorById,
  updateEvaluator,
} = require("../../../controllers/examination/postExamination/evaluatorController");

// All routes require authentication
router.use(authenticationMiddleware);

// @route   GET /api/examination/evaluators
router.get("/", getAllEvaluators);

// @route   GET /api/examination/evaluators/:id
router.get("/:id", getEvaluatorById);

// @route   PUT /api/examination/evaluators/:id
router.put("/:id", updateEvaluator);

module.exports = router;

