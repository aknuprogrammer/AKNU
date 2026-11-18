const express = require("express");
const {
  getCollegeCategories,
  createCollegeCategory,
  updateCollegeCategory,
  deleteCollegeCategory,
  getCollegeCategoryById,
} = require("../../../controllers/examination/selector/collegeCategoryController");
const router = express.Router();

router.get("/", getCollegeCategories);
router.post("/", createCollegeCategory);
router.get("/:id", getCollegeCategoryById);
router.put("/:id", updateCollegeCategory);
router.delete("/:id", deleteCollegeCategory);

module.exports = router;

