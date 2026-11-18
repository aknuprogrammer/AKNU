const express = require("express");
const courseController = require("../../controllers/certificationFee/courseController");
const router = express.Router();
router
  .route("/")
  .post(courseController.createCourse)
  .get(courseController.getAllCourses);

router
  .route("/:id")
  .get(courseController.getCourseById)
  .put(courseController.updateCourse)
  .delete(courseController.deleteCourse);

module.exports = router;
