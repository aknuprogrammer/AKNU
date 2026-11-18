const express = require("express");
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  restoreCourse,
} = require("../../../controllers/admission/selector/courseController");
const router = express.Router();

// CRUD APIs
router.post("/", createCourse);
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.put("/:id/restore", restoreCourse);
router.delete("/:id", deleteCourse);

module.exports = router;
