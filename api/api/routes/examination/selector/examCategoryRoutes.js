const express = require("express");
const {
  getExamCategories,
  createExamCategory,
  updateExamCategory,
  deleteExamCategory,
  getExamCategoryById,
} = require("../../../controllers/examination/selector/examCategoryController");
const router = express.Router();

router.get("/", getExamCategories);
router.post("/", createExamCategory);
router.get("/:id", getExamCategoryById);
router.put("/:id", updateExamCategory);
router.delete("/:id", deleteExamCategory);

module.exports = router;

