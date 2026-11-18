const express = require("express");
const {
  getColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
  getCollegesByType,
  getCollegesByCategory,
  getCollegesByCourseCategory,
  getCollegesByLocation,
  getCollegesByStatus,
  getCollegesByClassification,
} = require("../../../controllers/admission/selector/collegeController");
const router = express.Router();

router.get("/", getColleges);
router.post("/", createCollege);
router.get("/type/:collegeTypeId", getCollegesByType);
router.get("/category/:collegeCategoryId", getCollegesByCategory);
router.get("/course-category/:courseCategoryId", getCollegesByCourseCategory);
router.get("/location", getCollegesByLocation);
router.get("/status/:status", getCollegesByStatus);
router.get("/classification", getCollegesByClassification);
router.get("/:id", getCollegeById);
router.put("/:id", updateCollege);
router.delete("/:id", deleteCollege);

module.exports = router;
