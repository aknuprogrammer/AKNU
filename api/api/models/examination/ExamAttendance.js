const mongoose = require("mongoose");

const examAttendanceSchema = new mongoose.Schema(
  {
    // Examination details
    examinationCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExaminationCenter",
      required: true,
      index: true,
    },
    examinationCenterName: {
      type: String,
      trim: true,
    },
    examinationCenterCode: {
      type: String,
      trim: true,
    },

    // Subject and exam details
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true,
    },
    subjectName: {
      type: String,
      trim: true,
    },

    // Timetable entry reference
    timetableEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimetableEntry",
      index: true,
    },

    // Exam date and time
    examDate: {
      type: Date,
      required: true,
      index: true,
    },
    examTime: {
      type: String,
      trim: true,
    },

    // Student details
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      index: true,
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    // Course and semester
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    courseName: {
      type: String,
      trim: true,
    },
    semester: {
      type: String,
      trim: true,
    },

    // Attendance status
    attendanceStatus: {
      type: String,
      enum: ["Present", "Absent"],
      required: true,
      default: "Present",
    },

    // Invigilator details
    invigilatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invigilator",
    },
    invigilatorName: {
      type: String,
      trim: true,
    },
    invigilatorCode: {
      type: String,
      trim: true,
    },
    invigilatorEmployeeId: {
      type: String,
      trim: true,
    },

    // Additional details
    markedBy: {
      type: String,
      trim: true,
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
examAttendanceSchema.index({ examDate: 1, subjectId: 1 });
examAttendanceSchema.index({ rollNumber: 1, examDate: 1 });
examAttendanceSchema.index({ invigilatorId: 1, examDate: 1 });

module.exports = mongoose.model("ExamAttendance", examAttendanceSchema);

