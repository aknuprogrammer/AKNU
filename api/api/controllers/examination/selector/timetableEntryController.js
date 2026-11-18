// @desc Get all timetable entries

const TimetableEntry = require("../../../models/examination/selector/TimetableEntry");

// @route GET /api/examination/timetable-entries
exports.getTimetableEntries = async (req, res) => {
  try {
    const timetableEntries = await TimetableEntry.find()
      .populate("courseId", "code name")
      .populate("academicYearId", "code startDate endDate")
      .populate("subjectId", "code name")
      .populate("streamId", "code name")
      .sort({ examDate: 1, examTime: 1 });
    res.json(timetableEntries);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create a timetable entry
// @route POST /api/examination/timetable-entries
exports.createTimetableEntry = async (req, res) => {
  try {
    const {
      examinationType,
      semester,
      courseId,
      courseName,
      courseCode,
      academicYearId,
      academicYearName,
      academicYearCode,
      subjectId,
      subjectName,
      subjectCode,
      streamId,
      streamName,
      streamCode,
      paperType,
      examDate,
      examTime,
      duration,
      notes,
    } = req.body;

    // The pre-save hook in the model will handle auto-population of names/codes
    const timetableEntry = new TimetableEntry({
      examinationType,
      semester,
      courseId,
      courseName,
      courseCode,
      academicYearId,
      academicYearName,
      academicYearCode,
      subjectId,
      subjectName,
      subjectCode,
      streamId,
      streamName,
      streamCode,
      paperType,
      examDate,
      examTime,
      duration,
      notes,
    });

    await timetableEntry.save();

    // Populate before sending response
    await timetableEntry.populate("courseId", "code name");
    await timetableEntry.populate("academicYearId", "code startDate endDate");
    await timetableEntry.populate("subjectId", "code name");
    await timetableEntry.populate("streamId", "code name");

    res.status(201).json(timetableEntry);
  } catch (error) {
    console.error("Error creating timetable entry:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate timetable entry",
        error:
          "A timetable entry with this combination already exists (examinationType + semester + course + academicYear + subject + stream + paperType)",
      });
    }
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update a timetable entry
// @route PUT /api/examination/timetable-entries/:id
exports.updateTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTimetableEntry = await TimetableEntry.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    )
      .populate("courseId", "code name")
      .populate("academicYearId", "code startDate endDate")
      .populate("subjectId", "code name")
      .populate("streamId", "code name");
    if (!updatedTimetableEntry)
      return res.status(404).json({ message: "Timetable entry not found" });
    res.json(updatedTimetableEntry);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate timetable entry",
        error:
          "A timetable entry with this combination already exists (examinationType + semester + course + academicYear + subject + stream + paperType)",
      });
    }
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete a timetable entry
// @route DELETE /api/examination/timetable-entries/:id
exports.deleteTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTimetableEntry = await TimetableEntry.findByIdAndDelete(id);
    if (!deletedTimetableEntry)
      return res
        .status(404)
        .json({ message: "Timetable entry not found" });
    res.json({ message: "Timetable entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get single timetable entry by ID
// @route GET /api/examination/timetable-entries/:id
exports.getTimetableEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const timetableEntry = await TimetableEntry.findById(id)
      .populate("courseId", "code name")
      .populate("academicYearId", "code startDate endDate")
      .populate("subjectId", "code name")
      .populate("streamId", "code name");
    if (!timetableEntry)
      return res.status(404).json({ message: "Timetable entry not found" });
    res.json(timetableEntry);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get timetable entries by examinationType
// @route GET /api/examination/timetable-entries/examination-type/:examinationType
exports.getTimetableEntriesByExaminationType = async (req, res) => {
  try {
    const { examinationType } = req.params;
    const timetableEntries = await TimetableEntry.find({ examinationType })
      .populate("courseId", "code name")
      .populate("academicYearId", "code startDate endDate")
      .populate("subjectId", "code name")
      .populate("streamId", "code name")
      .sort({ examDate: 1, examTime: 1 });
    res.json(timetableEntries);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get timetable entries by semester
// @route GET /api/examination/timetable-entries/semester/:semester
exports.getTimetableEntriesBySemester = async (req, res) => {
  try {
    const { semester } = req.params;
    const timetableEntries = await TimetableEntry.find({ semester })
      .populate("courseId", "code name")
      .populate("academicYearId", "code startDate endDate")
      .populate("subjectId", "code name")
      .populate("streamId", "code name")
      .sort({ examDate: 1, examTime: 1 });
    res.json(timetableEntries);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get timetable entries by courseId
// @route GET /api/examination/timetable-entries/course/:courseId
exports.getTimetableEntriesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const timetableEntries = await TimetableEntry.find({ courseId })
      .populate("courseId", "code name")
      .populate("academicYearId", "code startDate endDate")
      .populate("subjectId", "code name")
      .populate("streamId", "code name")
      .sort({ examDate: 1, examTime: 1 });
    res.json(timetableEntries);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get timetable entries by academicYearId
// @route GET /api/examination/timetable-entries/academic-year/:academicYearId
exports.getTimetableEntriesByAcademicYear = async (req, res) => {
  try {
    const { academicYearId } = req.params;
    const timetableEntries = await TimetableEntry.find({ academicYearId })
      .populate("courseId", "code name")
      .populate("academicYearId", "code startDate endDate")
      .populate("subjectId", "code name")
      .populate("streamId", "code name")
      .sort({ examDate: 1, examTime: 1 });
    res.json(timetableEntries);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get timetable entries by subjectId
// @route GET /api/examination/timetable-entries/subject/:subjectId
exports.getTimetableEntriesBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const timetableEntries = await TimetableEntry.find({ subjectId })
      .populate("courseId", "code name")
      .populate("academicYearId", "code startDate endDate")
      .populate("subjectId", "code name")
      .populate("streamId", "code name")
      .sort({ examDate: 1, examTime: 1 });
    res.json(timetableEntries);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get timetable entries by streamId
// @route GET /api/examination/timetable-entries/stream/:streamId
exports.getTimetableEntriesByStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const timetableEntries = await TimetableEntry.find({ streamId })
      .populate("courseId", "code name")
      .populate("academicYearId", "code startDate endDate")
      .populate("subjectId", "code name")
      .populate("streamId", "code name")
      .sort({ examDate: 1, examTime: 1 });
    res.json(timetableEntries);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get timetable entries by examDate range
// @route GET /api/examination/timetable-entries/date-range/:startDate/:endDate
exports.getTimetableEntriesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const timetableEntries = await TimetableEntry.find({
      examDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate("courseId", "code name")
      .populate("academicYearId", "code startDate endDate")
      .populate("subjectId", "code name")
      .populate("streamId", "code name")
      .sort({ examDate: 1, examTime: 1 });
    res.json(timetableEntries);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get timetable entries by section (examinationType + semester + courseId + academicYearId)
// @route GET /api/examination/timetable-entries/section
exports.getTimetableEntriesBySection = async (req, res) => {
  try {
    const { examinationType, semester, courseId, academicYearId } = req.query;
    const query = {};
    if (examinationType) query.examinationType = examinationType;
    if (semester) query.semester = semester;
    if (courseId) query.courseId = courseId;
    if (academicYearId) query.academicYearId = academicYearId;

    const timetableEntries = await TimetableEntry.find(query)
      .populate("courseId", "code name")
      .populate("academicYearId", "code startDate endDate")
      .populate("subjectId", "code name")
      .populate("streamId", "code name")
      .sort({ examDate: 1, examTime: 1 });
    res.json(timetableEntries);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Delete timetable entries by criteria (bulk delete)
// @route DELETE /api/examination/timetable-entries/bulk
exports.deleteTimetableEntriesByCriteria = async (req, res) => {
  try {
    const {
      examinationType,
      semester,
      courseId,
      academicYearId,
      subjectId,
      streamId,
      paperType,
    } = req.query;

    // Build query object from provided criteria
    const query = {};
    if (examinationType) query.examinationType = examinationType;
    if (semester) query.semester = semester;
    if (courseId) query.courseId = courseId;
    if (academicYearId) query.academicYearId = academicYearId;
    if (subjectId) query.subjectId = subjectId;
    if (streamId) query.streamId = streamId;
    if (paperType) query.paperType = paperType;

    // Check if query is empty (prevent deleting all entries)
    if (Object.keys(query).length === 0) {
      return res.status(400).json({
        message: "Invalid request",
        error: "At least one criteria must be provided for bulk delete",
      });
    }

    // Find entries matching criteria
    const entriesToDelete = await TimetableEntry.find(query);
    
    if (entriesToDelete.length === 0) {
      return res.status(404).json({
        message: "No entries found",
        count: 0,
      });
    }

    // Delete entries
    const deleteResult = await TimetableEntry.deleteMany(query);

    res.json({
      message: "Timetable entries deleted successfully",
      deletedCount: deleteResult.deletedCount,
      criteria: query,
    });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Delete timetable entry by specific combination
// @route DELETE /api/examination/timetable-entries/combination
exports.deleteTimetableEntryByCombination = async (req, res) => {
  try {
    const {
      examinationType,
      semester,
      courseId,
      academicYearId,
      subjectId,
      streamId,
      paperType,
    } = req.body;

    // Validate all required fields for unique combination
    if (
      !examinationType ||
      !semester ||
      !courseId ||
      !academicYearId ||
      !subjectId ||
      !streamId ||
      !paperType
    ) {
      return res.status(400).json({
        message: "Invalid request",
        error:
          "All fields are required: examinationType, semester, courseId, academicYearId, subjectId, streamId, paperType",
      });
    }

    // Find and delete the specific entry
    const deletedEntry = await TimetableEntry.findOneAndDelete({
      examinationType,
      semester,
      courseId,
      academicYearId,
      subjectId,
      streamId,
      paperType,
    });

    if (!deletedEntry) {
      return res.status(404).json({
        message: "Timetable entry not found",
        error: "No entry matches the provided combination",
      });
    }

    res.json({
      message: "Timetable entry deleted successfully",
      deletedEntry: {
        _id: deletedEntry._id,
        examinationType: deletedEntry.examinationType,
        semester: deletedEntry.semester,
        paperType: deletedEntry.paperType,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

