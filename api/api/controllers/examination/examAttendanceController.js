const ExamAttendance = require("../../models/examination/ExamAttendance");
const ExaminationPaymentTransaction = require("../../models/examination/ExaminationPaymentTransaction");

// @desc Get all exam attendance records
// @route GET /api/examination/exam-attendance
exports.getExamAttendance = async (req, res) => {
  try {
    const {
      examDate,
      subjectId,
      rollNumber,
      examinationCenterId,
      invigilatorId,
    } = req.query;

    const query = {};
    if (examDate) query.examDate = new Date(examDate);
    if (subjectId) query.subjectId = subjectId;
    if (rollNumber) query.rollNumber = rollNumber;
    if (examinationCenterId) query.examinationCenterId = examinationCenterId;
    if (invigilatorId) query.invigilatorId = invigilatorId;

    const attendance = await ExamAttendance.find(query)
      .populate("studentId", "registrationNumber name")
      .populate("subjectId", "code name")
      .populate("examinationCenterId", "name code")
      .populate("invigilatorId", "name invigilatorCode")
      .sort({ examDate: -1, createdAt: -1 });

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get students who appeared for exam (from payment transactions)
// @route GET /api/examination/exam-attendance/students
exports.getStudentsForAttendance = async (req, res) => {
  try {
    const { examDate, subjectCode, semester } = req.query;

    // Get students who have paid for exams
    const query = { payment_status: "SUCCESS" };
    if (semester) query.semester = semester;

    const transactions = await ExaminationPaymentTransaction.find(query)
      .sort({ createdAt: -1 });

    // Filter by subject if provided
    let students = transactions.map((txn) => ({
      registrationNumber: txn.registration_number,
      studentName: txn.student_name,
      course: txn.course,
      semester: txn.semester,
      subjects: [
        ...(txn.regular_subjects || []),
        ...(txn.supplementary_subjects || []),
      ],
    }));

    if (subjectCode) {
      students = students.filter((student) =>
        student.subjects.includes(subjectCode)
      );
    }

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Create exam attendance record
// @route POST /api/examination/exam-attendance
exports.createExamAttendance = async (req, res) => {
  try {
    const attendanceData = req.body;

    // Check if attendance already exists for this student, subject, and date
    const existing = await ExamAttendance.findOne({
      rollNumber: attendanceData.rollNumber,
      subjectId: attendanceData.subjectId,
      examDate: new Date(attendanceData.examDate),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Attendance already recorded for this student, subject, and date",
      });
    }

    const attendance = new ExamAttendance(attendanceData);
    await attendance.save();

    await attendance.populate([
      { path: "studentId", select: "registrationNumber name" },
      { path: "subjectId", select: "code name" },
      { path: "examinationCenterId", select: "name code" },
      { path: "invigilatorId", select: "name invigilatorCode" },
    ]);

    res.status(201).json({
      success: true,
      data: attendance,
      message: "Attendance recorded successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid Data",
      error: error.message,
    });
  }
};

// @desc Bulk create exam attendance records
// @route POST /api/examination/exam-attendance/bulk
exports.bulkCreateExamAttendance = async (req, res) => {
  try {
    const { attendanceRecords } = req.body;

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: "attendanceRecords must be a non-empty array",
      });
    }

    const results = [];
    const errors = [];

    for (const record of attendanceRecords) {
      try {
        // Check if attendance already exists
        const existing = await ExamAttendance.findOne({
          rollNumber: record.rollNumber,
          subjectId: record.subjectId,
          examDate: new Date(record.examDate),
        });

        if (existing) {
          errors.push({
            rollNumber: record.rollNumber,
            error: "Attendance already exists",
          });
          continue;
        }

        const attendance = new ExamAttendance(record);
        await attendance.save();
        results.push(attendance);
      } catch (error) {
        errors.push({
          rollNumber: record.rollNumber,
          error: error.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      data: results,
      errors: errors,
      message: `Successfully created ${results.length} attendance records`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid Data",
      error: error.message,
    });
  }
};

// @desc Update exam attendance record
// @route PUT /api/examination/exam-attendance/:id
exports.updateExamAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const attendance = await ExamAttendance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("studentId", "registrationNumber name")
      .populate("subjectId", "code name")
      .populate("examinationCenterId", "name code")
      .populate("invigilatorId", "name invigilatorCode");

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.json({
      success: true,
      data: attendance,
      message: "Attendance updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid Data",
      error: error.message,
    });
  }
};

// @desc Delete exam attendance record
// @route DELETE /api/examination/exam-attendance/:id
exports.deleteExamAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await ExamAttendance.findByIdAndDelete(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

