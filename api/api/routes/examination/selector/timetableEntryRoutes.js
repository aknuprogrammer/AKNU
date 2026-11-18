const express = require("express");
const {
  getTimetableEntries,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getTimetableEntryById,
  getTimetableEntriesByExaminationType,
  getTimetableEntriesBySemester,
  getTimetableEntriesByCourse,
  getTimetableEntriesByAcademicYear,
  getTimetableEntriesBySubject,
  getTimetableEntriesByStream,
  getTimetableEntriesByDateRange,
  getTimetableEntriesBySection,
  deleteTimetableEntriesByCriteria,
  deleteTimetableEntryByCombination,
} = require("../../../controllers/examination/selector/timetableEntryController");
const router = express.Router();

router.get("/", getTimetableEntries);
router.post("/", createTimetableEntry);
router.get("/section", getTimetableEntriesBySection);
router.get("/examination-type/:examinationType", getTimetableEntriesByExaminationType);
router.get("/semester/:semester", getTimetableEntriesBySemester);
router.get("/course/:courseId", getTimetableEntriesByCourse);
router.get("/academic-year/:academicYearId", getTimetableEntriesByAcademicYear);
router.get("/subject/:subjectId", getTimetableEntriesBySubject);
router.get("/stream/:streamId", getTimetableEntriesByStream);
router.get("/date-range/:startDate/:endDate", getTimetableEntriesByDateRange);
router.delete("/bulk", deleteTimetableEntriesByCriteria);
router.delete("/combination", deleteTimetableEntryByCombination);
router.get("/:id", getTimetableEntryById);
router.put("/:id", updateTimetableEntry);
router.delete("/:id", deleteTimetableEntry);

module.exports = router;

