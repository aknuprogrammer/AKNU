const express = require("express");
const {
  getInternalExamSetups,
  createInternalExamSetup,
  updateInternalExamSetup,
  deleteInternalExamSetup,
  getInternalExamSetupById,
  getSetupsByCourse,
  getSetupsBySubject,
  getStudentsForInternalMarks,
  getStudentsByCourseStream,
} = require("../../controllers/examination/internalExamSetupController");
const router = express.Router();

router.get("/", getInternalExamSetups);
router.post("/", createInternalExamSetup);
router.get("/course/:courseId", getSetupsByCourse);
router.get("/subject/:subjectId", getSetupsBySubject);
// Student endpoints for internal marks entry (must come before /:id route)
router.get("/students", getStudentsForInternalMarks);
router.get("/students/filter", getStudentsByCourseStream);
router.get("/:id", getInternalExamSetupById);
router.put("/:id", updateInternalExamSetup);
router.delete("/:id", deleteInternalExamSetup);

module.exports = router;

