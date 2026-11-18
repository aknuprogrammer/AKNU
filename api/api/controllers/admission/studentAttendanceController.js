const StudentAttendance = require("../../models/admission/StudentAttendance");
const mongoose = require("mongoose");

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  if (!id || id === "" || id === "null" || id === "undefined") return false;
  return mongoose.Types.ObjectId.isValid(id);
};

// @desc Get attendance records
// @route GET /api/student-attendance
exports.getAttendance = async (req, res) => {
  try {
    const { date, subjectId, courseId, branchId, semesterId, studentId } = req.query;
    
    let query = {};
    
    // Date filtering
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    
    // Validate and add ObjectId filters
    if (subjectId && isValidObjectId(subjectId)) {
      query.subjectId = new mongoose.Types.ObjectId(subjectId);
    }
    if (courseId && isValidObjectId(courseId)) {
      query.courseId = new mongoose.Types.ObjectId(courseId);
    }
    if (branchId && isValidObjectId(branchId)) {
      query.branchId = new mongoose.Types.ObjectId(branchId);
    }
    if (semesterId && isValidObjectId(semesterId)) {
      query.semesterId = new mongoose.Types.ObjectId(semesterId);
    }
    if (studentId && isValidObjectId(studentId)) {
      query.studentId = new mongoose.Types.ObjectId(studentId);
    }

    console.log("Attendance query:", JSON.stringify(query, null, 2));

    // Find attendance records from studentattendences collection
    const attendance = await StudentAttendance.find(query)
      .populate("studentId", "firstName lastName registrationNumber hallTicketNo")
      .populate("subjectId", "name code")
      .populate("courseId", "name code")
      .populate("branchId", "name code")
      .populate("semesterId", "numberOfSemesters description")
      .sort({ date: -1, studentId: 1 });

    console.log(`Found ${attendance.length} attendance records`);

    res.json({ success: true, count: attendance.length, data: attendance });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

// @desc Bulk create/update attendance
// @route POST /api/student-attendance/bulk
exports.bulkCreateAttendance = async (req, res) => {
  try {
    const { records, date, subjectId, markedBy } = req.body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: "No attendance records provided" });
    }

    const bulkOps = records.map(record => ({
      updateOne: {
        filter: { 
          studentId: record.studentId, 
          subjectId: record.subjectId || subjectId, 
          date: record.date || date 
        },
        update: { $set: { ...record, markedBy: markedBy || "Admin" } },
        upsert: true
      }
    }));

    await StudentAttendance.bulkWrite(bulkOps);

    res.status(200).json({ success: true, message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Bulk attendance error:", error);
    res.status(500).json({ success: false, message: "Failed to mark attendance", error: error.message });
  }
};
