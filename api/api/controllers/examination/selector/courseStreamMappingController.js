// @desc Course Stream Mapping Controller

const CourseStreamMapping = require("../../../models/examination/selector/CourseStreamMapping");
const mongoose = require("mongoose");

// @route GET /api/examination/course-stream-mappings
exports.getCourseStreamMappings = async (req, res) => {
  try {
    const { courseId, streamId, semesterId, includeInactive } = req.query;
    let query = {};

    if (courseId) query.courseId = courseId;
    if (streamId) query.streamId = streamId;
    if (semesterId) query.semesterId = semesterId;

    // By default, only show Active records
    if (includeInactive !== "true") {
      query.status = "Active";
    }

    const mappings = await CourseStreamMapping.find(query)
      .populate("courseId", "code name comments")
      .populate("streamId", "code name status")
      .populate("semesterId", "numberOfSemesters description status")
      .populate("subjects.subjectId", "code name syllabus status")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: mappings.length,
      data: mappings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @route GET /api/examination/course-stream-mappings/:id
exports.getCourseStreamMappingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mapping ID format",
      });
    }

    const mapping = await CourseStreamMapping.findById(id)
      .populate("courseId", "code name comments")
      .populate("streamId", "code name status")
      .populate("semesterId", "numberOfSemesters description status")
      .populate("subjects.subjectId", "code name syllabus status");

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: "Course stream mapping not found",
      });
    }

    res.json({
      success: true,
      data: mapping,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @route POST /api/examination/course-stream-mappings
exports.createCourseStreamMapping = async (req, res) => {
  try {
    const { courseId, streamId, semesterId, semesterNumber, subjects, timePeriod, status, notes } = req.body;

    const mapping = new CourseStreamMapping({
      courseId,
      streamId,
      semesterId,
      semesterNumber,
      subjects,
      timePeriod,
      status,
      notes,
    });

    await mapping.save();

    // Populate before sending response
    await mapping.populate("courseId", "code name comments");
    await mapping.populate("streamId", "code name status");
    await mapping.populate("semesterId", "numberOfSemesters description status");
    await mapping.populate("subjects.subjectId", "code name syllabus status");

    res.status(201).json({
      success: true,
      message: "Course stream mapping created successfully",
      data: mapping,
    });
  } catch (error) {
    console.error("Error creating course stream mapping:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate mapping",
        error: "A mapping with this course-stream-semester combination already exists",
      });
    }

    res.status(400).json({
      success: false,
      message: "Invalid Data",
      error: error.message,
    });
  }
};

// @route PUT /api/examination/course-stream-mappings/:id
exports.updateCourseStreamMapping = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mapping ID format",
      });
    }

    const updatedMapping = await CourseStreamMapping.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("courseId", "code name comments")
      .populate("streamId", "code name status")
      .populate("semesterId", "numberOfSemesters description status")
      .populate("subjects.subjectId", "code name syllabus status");

    if (!updatedMapping) {
      return res.status(404).json({
        success: false,
        message: "Course stream mapping not found",
      });
    }

    res.json({
      success: true,
      message: "Course stream mapping updated successfully",
      data: updatedMapping,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate mapping",
        error: "A mapping with this course-stream-semester combination already exists",
      });
    }

    res.status(400).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

// @route DELETE /api/examination/course-stream-mappings/:id
exports.deleteCourseStreamMapping = async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mapping ID format",
      });
    }

    const mapping = await CourseStreamMapping.findById(id);

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: "Course stream mapping not found",
      });
    }

    // If hardDelete is explicitly requested, perform actual deletion
    if (hardDelete === "true") {
      const deletedMapping = await CourseStreamMapping.findByIdAndDelete(id);
      if (!deletedMapping) {
        return res.status(404).json({
          success: false,
          message: "Course stream mapping not found",
        });
      }

      return res.json({
        success: true,
        message: "Course stream mapping permanently deleted successfully",
        data: {
          _id: deletedMapping._id,
          courseId: deletedMapping.courseId,
          streamId: deletedMapping.streamId,
          semesterId: deletedMapping.semesterId,
        },
      });
    }

    // Default: Soft delete (set status to Inactive)
    await mapping.softDelete();

    res.json({
      success: true,
      message: "Course stream mapping deleted successfully (status set to Inactive)",
      data: mapping,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};

// @route GET /api/examination/course-stream-mappings/course/:courseId
exports.getMappingsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { activeOnly } = req.query;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format",
      });
    }

    const options = { activeOnly: activeOnly !== "false" };
    const mappings = await CourseStreamMapping.findByCourse(courseId, options);

    res.json({
      success: true,
      count: mappings.length,
      data: mappings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @route GET /api/examination/course-stream-mappings/course/:courseId/stream/:streamId
exports.getMappingsByCourseAndStream = async (req, res) => {
  try {
    const { courseId, streamId } = req.params;
    const { activeOnly } = req.query;

    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(streamId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid course or stream ID format",
      });
    }

    const options = { activeOnly: activeOnly !== "false" };
    const mappings = await CourseStreamMapping.findByCourseAndStream(
      courseId,
      streamId,
      options
    );

    res.json({
      success: true,
      count: mappings.length,
      data: mappings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @route PUT /api/examination/course-stream-mappings/:id/restore
exports.restoreCourseStreamMapping = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mapping ID format",
      });
    }

    const mapping = await CourseStreamMapping.findById(id);

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: "Course stream mapping not found",
      });
    }

    await mapping.restore();

    res.json({
      success: true,
      message: "Course stream mapping restored successfully",
      data: mapping,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Restore failed",
      error: error.message,
    });
  }
};

