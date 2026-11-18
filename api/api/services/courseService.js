const Course = require('../models/certificationFee/courseModel');
// const ApiError = require('../utils/apiError');

const createCourse = async (courseData) => {
  return await Course.create(courseData);
};

const getAllCourses = async () => {
  return await Course.find();
};

const getCourseById = async (id) => {
  const course = await Course.findById(id);
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }
  return course;
};

const updateCourse = async (id, updateData) => {
  const course = await Course.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }
  return course;
};

const deleteCourse = async (id) => {
  const course = await Course.findByIdAndDelete(id);
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }
  return course;
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse
};