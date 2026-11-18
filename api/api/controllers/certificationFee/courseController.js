const courseService = require("../../services/courseService");
const ApiResponse = require("../../utils/certificationFee/apiResponse");
const asyncHandler = require("../../utils/certificationFee/asyncHandler");

const createCourse = asyncHandler(async (req, res) => {
  console.log("___req.body", req.body);
  const course = await courseService.createCourse(req.body);
  console.log("_____course", course);
  res.status(201).json(new ApiResponse(201, course));
});

const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getAllCourses();
  res.status(200).json(new ApiResponse(200, courses));
});

const getCourseById = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.id);
  res.status(200).json(new ApiResponse(200, course));
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, course));
});

const deleteCourse = asyncHandler(async (req, res) => {
  const deleted = await courseService.deleteCourse(req.params.id);

  if (!deleted) {
    return res
      .status(404)
      .json({ success: false, message: "Course not found" });
  }

  res.json({ success: true, message: "Course deleted successfully" });
});

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
