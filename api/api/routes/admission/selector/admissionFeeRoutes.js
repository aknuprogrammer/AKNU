const express = require("express");
const {
  getFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee,
  getFeeByCourseAndCampus,
} = require("../../../controllers/admission/selector/admissionFeeController");
const router = express.Router();

router.get("/", getFees);
router.get("/:id", getFeeById);
router.get("/course/:courseId/campus/:campusId", getFeeByCourseAndCampus);
router.post("/", createFee);
router.put("/:id", updateFee);
router.delete("/:id", deleteFee);

module.exports = router;
