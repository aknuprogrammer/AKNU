const express = require("express");
const {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectById,
} = require("../../../controllers/examination/selector/subjectController");
const router = express.Router();

router.get("/", getSubjects);
router.post("/", createSubject);
router.get("/:id", getSubjectById);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);

module.exports = router;

