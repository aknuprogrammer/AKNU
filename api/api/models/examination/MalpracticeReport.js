const mongoose = require("mongoose");

const malpracticeReportSchema = new mongoose.Schema(
  {
    // Report number (auto-generated)
    reportNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

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

    // Invigilator details (required)
    invigilatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invigilator",
      required: true,
      index: true,
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
      required: true,
      trim: true,
      index: true,
    },

    // Incident/Report details
    incidentType: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    evidence: {
      type: [String], // Array of file paths or URLs
      default: [],
    },

    // Additional details
    reportedBy: {
      type: String,
      trim: true,
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedBy: {
      type: String,
      trim: true,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
malpracticeReportSchema.index({ examDate: 1, subjectId: 1 });
malpracticeReportSchema.index({ rollNumber: 1, examDate: 1 });
malpracticeReportSchema.index({ invigilatorEmployeeId: 1, examDate: 1 });

// Generate report number before saving
malpracticeReportSchema.pre("save", async function (next) {
  // Always generate report number if not set
  if (!this.reportNumber || this.reportNumber.trim() === "") {
    try {
      const year = new Date().getFullYear();
      // Use this.constructor which should work in pre-save
      const MalpracticeReportModel = this.constructor;
      
      const count = await MalpracticeReportModel.countDocuments({
        examDate: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1),
        },
      });
      this.reportNumber = `ER-${year}-${String(count + 1).padStart(5, "0")}`;
    } catch (error) {
      console.error("Error generating report number:", error);
      // Fallback - use timestamp to ensure uniqueness
      const year = new Date().getFullYear();
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      this.reportNumber = `ER-${year}-${String(timestamp).slice(-8)}${String(random).padStart(3, "0")}`;
    }
  }
  
  // Final check - ensure reportNumber is always set
  if (!this.reportNumber || this.reportNumber.trim() === "") {
    const year = new Date().getFullYear();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.reportNumber = `ER-${year}-${String(timestamp).slice(-8)}${String(random).padStart(3, "0")}`;
  }
  
  next();
});

module.exports = mongoose.model("MalpracticeReport", malpracticeReportSchema);

