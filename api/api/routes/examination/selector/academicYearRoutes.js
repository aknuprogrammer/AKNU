const express = require("express");
const {
  getAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  getAcademicYearById,
} = require("../../../controllers/examination/selector/academicYearController");
const router = express.Router();

router.get("/", getAcademicYears);
router.post("/", createAcademicYear);
router.get("/:id", getAcademicYearById);
router.put("/:id", updateAcademicYear);
router.delete("/:id", deleteAcademicYear);

module.exports = router;

