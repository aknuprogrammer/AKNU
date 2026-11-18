const express = require("express");
const {
  getCollegeOtherCategories,
  createCollegeOtherCategory,
  updateCollegeOtherCategory,
  deleteCollegeOtherCategory,
  getCollegeOtherCategoryById,
} = require("../../../controllers/examination/selector/collegeOtherCategoryController");
const router = express.Router();

router.get("/", getCollegeOtherCategories);
router.post("/", createCollegeOtherCategory);
router.get("/:id", getCollegeOtherCategoryById);
router.put("/:id", updateCollegeOtherCategory);
router.delete("/:id", deleteCollegeOtherCategory);

module.exports = router;

