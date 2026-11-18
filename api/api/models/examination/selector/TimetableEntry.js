const mongoose = require("mongoose");

const timetableEntrySchema = new mongoose.Schema(
  {
    // Section Fields (Grouping Fields)
    examinationType: {
      type: String,
      required: true,
      enum: ["Regular", "Supplementary", "Revaluation"],
      trim: true,
    },
    semester: {
      type: String,
      required: true,
      trim: true,
      // e.g., "I Semester", "II Semester", "III Semester"
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course_data",
      required: true,
    },
    // Denormalized fields for display/search
    courseName: {
      type: String,
      trim: true,
    },
    courseCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    // Denormalized fields for display/search
    academicYearName: {
      type: String,
      trim: true,
    },
    academicYearCode: {
      type: String,
      trim: true,
    },

    // Entry Fields
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    // Denormalized fields for display/search
    subjectName: {
      type: String,
      trim: true,
    },
    subjectCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    streamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
      required: true,
    },
    // Denormalized fields for display/search
    streamName: {
      type: String,
      trim: true,
    },
    streamCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    paperType: {
      type: String,
      required: true,
      trim: true,
      // e.g., "Paper 1", "Paper 2", "Paper 3"
    },
    examDate: {
      type: Date,
      required: true,
    },
    examTime: {
      type: String,
      required: true,
      trim: true,
      // e.g., "10:00", "14:00"
    },
    duration: {
      type: String,
      required: true,
      trim: true,
      // e.g., "3 hours", "2.5 hours"
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    collection: "timetable_entries",
  }
);

// Compound Index for Uniqueness
// Unique constraint: Subject + Stream + Paper within same section
// Section = Examination Type + Semester + Course + Academic Year
timetableEntrySchema.index(
  {
    examinationType: 1,
    semester: 1,
    courseId: 1,
    academicYearId: 1,
    subjectId: 1,
    streamId: 1,
    paperType: 1,
  },
  {
    unique: true,
    name: "unique_timetable_entry",
  }
);

// Indexes for common queries
timetableEntrySchema.index({ examinationType: 1, semester: 1 });
timetableEntrySchema.index({ courseId: 1 });
timetableEntrySchema.index({ academicYearId: 1 });
timetableEntrySchema.index({ subjectId: 1 });
timetableEntrySchema.index({ streamId: 1 });
timetableEntrySchema.index({ examDate: 1 });

// Pre-save hook to update updatedAt and auto-populate denormalized fields
timetableEntrySchema.pre("save", async function (next) {
  this.updatedAt = Date.now();

  // Auto-populate courseName and courseCode from courseId if not provided
  if (this.courseId && (!this.courseName || !this.courseCode)) {
    try {
      const Course = mongoose.model("Course_data");
      const course = await Course.findById(this.courseId);
      if (course) {
        if (!this.courseName) {
          this.courseName = course.name;
        }
        if (!this.courseCode) {
          this.courseCode = course.code;
        }
      }
    } catch (error) {
      console.error("Error auto-populating course fields:", error.message);
    }
  }

  // Auto-populate academicYearName and academicYearCode from academicYearId if not provided
  if (
    this.academicYearId &&
    (!this.academicYearName || !this.academicYearCode)
  ) {
    try {
      const AcademicYear = mongoose.model("AcademicYear");
      const academicYear = await AcademicYear.findById(this.academicYearId);
      if (academicYear) {
        if (!this.academicYearName) {
          this.academicYearName = academicYear.code; // Using code as name
        }
        if (!this.academicYearCode) {
          this.academicYearCode = academicYear.code;
        }
      }
    } catch (error) {
      console.error(
        "Error auto-populating academicYear fields:",
        error.message
      );
    }
  }

  // Auto-populate subjectName and subjectCode from subjectId if not provided
  if (this.subjectId && (!this.subjectName || !this.subjectCode)) {
    try {
      const Subject = mongoose.model("Subject");
      const subject = await Subject.findById(this.subjectId);
      if (subject) {
        if (!this.subjectName) {
          this.subjectName = subject.name;
        }
        if (!this.subjectCode) {
          this.subjectCode = subject.code;
        }
      }
    } catch (error) {
      console.error("Error auto-populating subject fields:", error.message);
    }
  }

  // Auto-populate streamName and streamCode from streamId if not provided
  if (this.streamId && (!this.streamName || !this.streamCode)) {
    try {
      const Stream = mongoose.model("Stream");
      const stream = await Stream.findById(this.streamId);
      if (stream) {
        if (!this.streamName) {
          this.streamName = stream.name;
        }
        if (!this.streamCode) {
          this.streamCode = stream.code;
        }
      }
    } catch (error) {
      console.error("Error auto-populating stream fields:", error.message);
    }
  }

  next();
});

// Virtual for formatted date
timetableEntrySchema.virtual("formattedDate").get(function () {
  return this.examDate ? this.examDate.toLocaleDateString() : "";
});

// Method to get day name
timetableEntrySchema.methods.getDayName = function () {
  if (!this.examDate) return "";
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[this.examDate.getDay()];
};

// Force remove old model definition
if (mongoose.models.TimetableEntry) {
  delete mongoose.models.TimetableEntry;
}

const TimetableEntry = mongoose.model("TimetableEntry", timetableEntrySchema);

module.exports = TimetableEntry;

