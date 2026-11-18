const express = require("express");
const {
  getExaminationCenters,
  createExaminationCenter,
  updateExaminationCenter,
  deleteExaminationCenter,
  getExaminationCenterById,
  getExaminationCentersByCollege,
} = require("../../../controllers/examination/selector/examinationCenterController");
const router = express.Router();

router.get("/", getExaminationCenters);
router.post("/", createExaminationCenter);
router.get("/college/:collegeId", getExaminationCentersByCollege);
router.get("/:id", getExaminationCenterById);
router.put("/:id", updateExaminationCenter);
router.delete("/:id", deleteExaminationCenter);

module.exports = router;

