const express = require("express");
const {
  getExamCenterCollegeMappings,
  createExamCenterCollegeMapping,
  updateExamCenterCollegeMapping,
  deleteExamCenterCollegeMapping,
  getExamCenterCollegeMappingById,
  getMappingsByExamCenter,
  getMappingsByCollege,
  getMappingsByInvigilator,
} = require("../../../controllers/examination/selector/examCenterCollegeMappingController");
const router = express.Router();

router.get("/", getExamCenterCollegeMappings);
router.post("/", createExamCenterCollegeMapping);
router.get("/exam-center/:examCenterId", getMappingsByExamCenter);
router.get("/college/:collegeId", getMappingsByCollege);
router.get("/invigilator/:invigilatorId", getMappingsByInvigilator);
router.get("/:id", getExamCenterCollegeMappingById);
router.put("/:id", updateExamCenterCollegeMapping);
router.delete("/:id", deleteExamCenterCollegeMapping);

module.exports = router;

