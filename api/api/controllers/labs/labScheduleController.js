const LabSchedule = require("../../models/labs/LabSchedule");

// @desc Get all lab schedules
// @route GET /api/labs/lab-schedules
exports.getLabSchedules = async (req, res) => {
  try {
    const { labId, day, facultyId, status, course } = req.query;
    let query = {};

    if (labId) {
      query.labId = labId;
    }
    if (day) {
      query.day = day;
    }
    if (facultyId) {
      query.facultyId = facultyId;
    }
    if (status) {
      query.status = status;
    }
    if (course) {
      query.course = { $regex: course, $options: "i" };
    }

    const schedules = await LabSchedule.find(query)
      .populate("internalExamSetupId", "courseId streamId semesterId semesterNumber subjectId")
      .populate("internalExamSetupId.courseId", "code name")
      .populate("internalExamSetupId.streamId", "code name")
      .populate("internalExamSetupId.semesterId", "numberOfSemesters description")
      .populate("internalExamSetupId.subjectId", "code name")
      .populate("labId", "labName building location capacity")
      .sort({ date: 1, startTime: 1 });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get lab schedule by ID
// @route GET /api/labs/lab-schedules/:id
exports.getLabScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await LabSchedule.findById(id)
      .populate("internalExamSetupId", "courseId streamId semesterId semesterNumber subjectId")
      .populate("internalExamSetupId.courseId", "code name")
      .populate("internalExamSetupId.streamId", "code name")
      .populate("internalExamSetupId.semesterId", "numberOfSemesters description")
      .populate("internalExamSetupId.subjectId", "code name")
      .populate("labId", "labName building location capacity");

    if (!schedule) {
      return res.status(404).json({ message: "Lab schedule not found" });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create lab schedule
// @route POST /api/labs/lab-schedules
exports.createLabSchedule = async (req, res) => {
  try {
    // Check for time conflicts
    const { labId, date, day, startTime, endTime } = req.body;
    
    // Use date for conflict checking if available, otherwise fall back to day
    const conflictQuery = {
      labId,
      status: "Active",
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    };
    
    if (date) {
      // Convert date string to Date object for comparison (same day only)
      const scheduleDate = new Date(date);
      const startOfDay = new Date(scheduleDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(scheduleDate);
      endOfDay.setHours(23, 59, 59, 999);
      conflictQuery.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    } else if (day) {
      conflictQuery.day = day;
    }
    
    const conflictingSchedule = await LabSchedule.findOne(conflictQuery);

    if (conflictingSchedule) {
      return res.status(400).json({
        message: "Time slot conflict: Another schedule exists for this lab on the same date/day and time",
      });
    }

    // Ensure date is a Date object if provided as string
    const scheduleData = { ...req.body };
    if (scheduleData.date && typeof scheduleData.date === 'string') {
      scheduleData.date = new Date(scheduleData.date);
    }

    const schedule = new LabSchedule(scheduleData);
    await schedule.save();

    await schedule.populate("internalExamSetupId", "courseId streamId semesterId semesterNumber subjectId");
    await schedule.populate("internalExamSetupId.courseId", "code name");
    await schedule.populate("internalExamSetupId.streamId", "code name");
    await schedule.populate("internalExamSetupId.semesterId", "numberOfSemesters description");
    await schedule.populate("internalExamSetupId.subjectId", "code name");
    await schedule.populate("labId", "labName building location capacity");

    res.status(201).json(schedule);
  } catch (error) {
    console.error("Error creating lab schedule:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update lab schedule
// @route PUT /api/labs/lab-schedules/:id
exports.updateLabSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { labId, date, day, startTime, endTime } = req.body;

    // Check for time conflicts (excluding current schedule)
    if (labId && startTime && endTime && (date || day)) {
      const conflictQuery = {
        labId,
        status: "Active",
        _id: { $ne: id },
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
          },
        ],
      };
      
      if (date) {
        // Convert date string to Date object for comparison (same day only)
        const scheduleDate = new Date(date);
        const startOfDay = new Date(scheduleDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(scheduleDate);
        endOfDay.setHours(23, 59, 59, 999);
        conflictQuery.date = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      } else if (day) {
        conflictQuery.day = day;
      }
      
      const conflictingSchedule = await LabSchedule.findOne(conflictQuery);

      if (conflictingSchedule) {
        return res.status(400).json({
          message: "Time slot conflict: Another schedule exists for this lab on the same date/day and time",
        });
      }
    }

    // Ensure date is a Date object if provided as string
    const updateData = { ...req.body };
    if (updateData.date && typeof updateData.date === 'string') {
      updateData.date = new Date(updateData.date);
    }

    const schedule = await LabSchedule.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("internalExamSetupId", "courseId streamId semesterId semesterNumber subjectId")
      .populate("internalExamSetupId.courseId", "code name")
      .populate("internalExamSetupId.streamId", "code name")
      .populate("internalExamSetupId.semesterId", "numberOfSemesters description")
      .populate("internalExamSetupId.subjectId", "code name")
      .populate("labId", "labName building location capacity");

    if (!schedule) {
      return res.status(404).json({ message: "Lab schedule not found" });
    }

    res.json(schedule);
  } catch (error) {
    console.error("Error updating lab schedule:", error);
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete lab schedule
// @route DELETE /api/labs/lab-schedules/:id
exports.deleteLabSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await LabSchedule.findByIdAndDelete(id);

    if (!schedule) {
      return res.status(404).json({ message: "Lab schedule not found" });
    }

    res.json({ message: "Lab schedule deleted successfully", data: schedule });
  } catch (error) {
    console.error("Error deleting lab schedule:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};
