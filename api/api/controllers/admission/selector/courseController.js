const Course = require("../../../models/admission/selector/Course");
const mongoose = require("mongoose");

// Create Course
exports.createCourse = async (req, res) => {
  try {
    const { code, name, duration, status, comments } = req.body;

    const course = new Course({
      code,
      name,
      duration,
      status,
      comments,
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (err) {
    console.error("Error creating course:", err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate course code",
        error: "A course with this code already exists",
      });
    }
    res.status(400).json({
      success: false,
      message: "Invalid Data",
      error: err.message,
    });
  }
};

// Get All Courses
exports.getCourses = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    let query = {};

    // By default, only show Active records
    if (includeInactive !== "true") {
      query.status = "Active";
    }

    console.log("Course query:", JSON.stringify(query));
    const courses = await Course.find(query).sort({ name: 1 });
    console.log("Found courses:", courses.length);

    // Return response in the format expected by frontend
    res.status(200).json({
      success: true,
      statusCode: 200,
      data: courses,
      message: "Success",
    });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({
      statusCode: 500,
      data: [],
      message: "Server Error",
      error: err.message,
    });
  }
};

// Get Single Course
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

// Update Course
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }

    const course = await Course.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate course code",
        error: "A course with this code already exists",
      });
    }
    res.status(400).json({
      success: false,
      message: "Update failed",
      error: err.message,
    });
  }
};

// Delete Course (automatically soft deletes - sets status to Inactive)
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete } = req.query; // Optional: ?hardDelete=true for actual deletion

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // If hardDelete is explicitly requested, perform actual deletion
    if (hardDelete === "true") {
      const deletedCourse = await Course.findByIdAndDelete(id);
      if (!deletedCourse) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      return res.json({
        success: true,
        message: "Course permanently deleted successfully",
        data: {
          _id: deletedCourse._id,
          code: deletedCourse.code,
          name: deletedCourse.name,
        },
      });
    }

    // Default: Soft delete (set status to Inactive)
    // This will also trigger cascade soft delete for CourseStreamMappings
    course.status = "Inactive";
    await course.save();

    res.json({
      success: true,
      message: "Course deleted successfully (status set to Inactive). Dependent CourseStreamMappings also set to Inactive.",
      data: course,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: err.message,
    });
  }
};

// Restore Course from soft delete
exports.restoreCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    course.status = "Active";
    await course.save();

    res.json({
      success: true,
      message: "Course restored successfully",
      data: course,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Restore failed",
      error: err.message,
    });
  }
};
