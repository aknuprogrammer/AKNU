const express = require("express");
const {
  getCourseStreamMappings,
  getCourseStreamMappingById,
  createCourseStreamMapping,
  updateCourseStreamMapping,
  deleteCourseStreamMapping,
  getMappingsByCourse,
  getMappingsByCourseAndStream,
  restoreCourseStreamMapping,
} = require("../../../controllers/examination/selector/courseStreamMappingController");

const router = express.Router();

// GET routes (specific routes before :id)
router.get("/course/:courseId", getMappingsByCourse);
router.get("/course/:courseId/stream/:streamId", getMappingsByCourseAndStream);
router.get("/", getCourseStreamMappings);
router.get("/:id", getCourseStreamMappingById);

// POST routes
router.post("/", createCourseStreamMapping);

// PUT routes
router.put("/:id", updateCourseStreamMapping);
router.put("/:id/restore", restoreCourseStreamMapping);

// DELETE routes
router.delete("/:id", deleteCourseStreamMapping);

module.exports = router;

