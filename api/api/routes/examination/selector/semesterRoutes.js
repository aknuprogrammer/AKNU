const express = require("express");
const {
  getSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
  getSemesterById,
} = require("../../../controllers/examination/selector/semesterController");
const router = express.Router();

router.get("/", getSemesters);
router.post("/", createSemester);
router.get("/:id", getSemesterById);
router.put("/:id", updateSemester);
router.delete("/:id", deleteSemester);

module.exports = router;

