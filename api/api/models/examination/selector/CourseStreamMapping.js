const mongoose = require("mongoose");

// Nested Subject Schema
const semesterSubjectSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject ID is required"],
    },
    maxMarks: {
      type: Number,
      min: [0, "Max marks cannot be negative"],
      max: [10000, "Max marks cannot exceed 10000"],
      default: 100,
    },
    passMarks: {
      type: Number,
      min: [0, "Pass marks cannot be negative"],
      max: [10000, "Pass marks cannot exceed 10000"],
      default: 40,
      validate: {
        validator: function (v) {
          if (v === null || v === undefined) return true;
          if (this.maxMarks === null || this.maxMarks === undefined) return true;
          return v <= this.maxMarks;
        },
        message: "Pass marks cannot exceed max marks",
      },
    },
  },
  { _id: false }
);

// Main Mapping Schema
const courseStreamMappingSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course_data",
      required: [true, "Course ID is required"],
      index: true,
    },
    streamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
      required: [true, "Stream ID is required"],
      index: true,
    },
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: [true, "Semester ID is required"],
      index: true,
    },
    // NEW FIELD: Specific semester number (1, 2, 3, etc.)
    semesterNumber: {
      type: Number,
      required: [true, "Semester number is required"],
      min: [1, "Semester number must be at least 1"],
      validate: {
        validator: async function (value) {
          // Validate that semesterNumber doesn't exceed numberOfSemesters in Semester document
          if (!this.semesterId) return true; // Skip if semesterId not set yet
          try {
            const Semester = mongoose.model("Semester");
            const semester = await Semester.findById(this.semesterId);
            if (!semester) return false;
            return value <= semester.numberOfSemesters;
          } catch (err) {
            // If model not loaded, skip validation
            return true;
          }
        },
        message: function (props) {
          return `Semester number (${props.value}) cannot exceed the semester type's numberOfSemesters`;
        },
      },
    },
    subjects: {
      type: [semesterSubjectSchema],
      required: [true, "At least one subject is required"],
      validate: {
        validator: function (v) {
          if (!v || !Array.isArray(v) || v.length === 0) return false;
          if (v.some((s) => !s || !s.subjectId)) return false;
          const subjectIds = v.map((s) => s.subjectId.toString()).filter(Boolean);
          return subjectIds.length === new Set(subjectIds).size;
        },
        message: "At least one subject required, no duplicates allowed",
      },
    },
    timePeriod: {
      type: String,
      trim: true,
      maxlength: [50, "Time period cannot exceed 50 characters"],
      default: "",
    },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: "__v",
    collection: "course_stream_mappings",
  }
);

// Indexes
// Updated unique index to include semesterNumber
courseStreamMappingSchema.index(
  { courseId: 1, streamId: 1, semesterId: 1, semesterNumber: 1 },
  { unique: true, name: "unique_course_stream_semester_number" }
);

courseStreamMappingSchema.index({ courseId: 1, streamId: 1, status: 1 });
courseStreamMappingSchema.index({ "subjects.subjectId": 1 });

// Virtuals
courseStreamMappingSchema.virtual("course", {
  ref: "Course_data",
  localField: "courseId",
  foreignField: "_id",
  justOne: true,
});

courseStreamMappingSchema.virtual("stream", {
  ref: "Stream",
  localField: "streamId",
  foreignField: "_id",
  justOne: true,
});

courseStreamMappingSchema.virtual("semester", {
  ref: "Semester",
  localField: "semesterId",
  foreignField: "_id",
  justOne: true,
});

courseStreamMappingSchema.set("toJSON", { virtuals: true });

// Pre-save Validation
courseStreamMappingSchema.pre("save", async function (next) {
  try {
    if (
      !this.isModified("courseId") &&
      !this.isModified("streamId") &&
      !this.isModified("semesterId") &&
      !this.isModified("semesterNumber") &&
      !this.isModified("subjects")
    ) {
      return next();
    }

    // Validate Course exists
    if (mongoose.models.Course_data) {
      const Course = mongoose.model("Course_data");
      const course = await Course.findById(this.courseId);
      if (!course) throw new Error(`Course ${this.courseId} does not exist`);
    }

    // Validate Stream exists
    if (mongoose.models.Stream) {
      const Stream = mongoose.model("Stream");
      const stream = await Stream.findById(this.streamId);
      if (!stream) throw new Error(`Stream ${this.streamId} does not exist`);
    }

    // Validate Semester exists AND belongs to Course
    if (mongoose.models.Semester) {
      const Semester = mongoose.model("Semester");
      const semester = await Semester.findById(this.semesterId);
      if (!semester) {
        throw new Error(`Semester ${this.semesterId} does not exist`);
      }
      if (
        semester.courseId &&
        semester.courseId.toString() !== this.courseId.toString()
      ) {
        throw new Error(`Semester does not belong to this course`);
      }
      // Validate semesterNumber doesn't exceed numberOfSemesters
      if (this.semesterNumber && this.semesterNumber > semester.numberOfSemesters) {
        throw new Error(
          `Semester number (${this.semesterNumber}) cannot exceed the semester type's numberOfSemesters (${semester.numberOfSemesters})`
        );
      }
    }

    // Batch validate ALL subjects in ONE query
    if (mongoose.models.Subject && this.subjects && this.subjects.length > 0) {
      const Subject = mongoose.model("Subject");
      const subjectIds = this.subjects
        .map((s) => s.subjectId)
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

      if (subjectIds.length > 0) {
        const existingSubjects = await Subject.find({
          _id: { $in: subjectIds },
        });
        const existingIds = existingSubjects.map((s) => s._id.toString());
        const missingIds = subjectIds.filter(
          (id) => !existingIds.includes(id.toString())
        );

        if (missingIds.length > 0) {
          throw new Error(
            `Subject(s) ${missingIds.join(", ")} do not exist`
          );
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Methods
courseStreamMappingSchema.methods.isActive = function () {
  return this.status === "Active";
};

courseStreamMappingSchema.methods.softDelete = async function () {
  this.status = "Inactive";
  return await this.save();
};

courseStreamMappingSchema.methods.restore = async function () {
  this.status = "Active";
  return await this.save();
};

// Static methods
courseStreamMappingSchema.statics.findByCourse = function (courseId, options = {}) {
  const query = { courseId };
  if (options.activeOnly !== false) {
    query.status = "Active";
  }
  return this.find(query)
    .populate("streamId", "name code status")
    .populate("semesterId", "numberOfSemesters description status")
    .populate("subjects.subjectId", "name code syllabus status");
};

courseStreamMappingSchema.statics.findByCourseAndStream = function (
  courseId,
  streamId,
  options = {}
) {
  const query = { courseId, streamId };
  if (options.activeOnly !== false) {
    query.status = "Active";
  }
  return this.find(query)
    .populate("semesterId", "numberOfSemesters description status")
    .populate("subjects.subjectId", "name code syllabus status");
};

// Force remove old model definition
if (mongoose.models.CourseStreamMapping) {
  delete mongoose.models.CourseStreamMapping;
}

const CourseStreamMapping = mongoose.model(
  "CourseStreamMapping",
  courseStreamMappingSchema
);

module.exports = CourseStreamMapping;

