const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [50, "Course code cannot exceed 50 characters"],
    },
    name: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
      maxlength: [200, "Course name cannot exceed 200 characters"],
    },
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: false,
      index: true,
    },
    duration: {
      type: Number,
      min: [1, "Duration must be at least 1 year"],
      max: [10, "Duration cannot exceed 10 years"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true,
    },
    comments: {
      type: String,
      trim: true,
      maxlength: [250, "Comments cannot exceed 250 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: "__v",
  }
);

// Indexes
// Note: code already has unique: true and index: true in field definition
// Note: status already has index: true in field definition
// Additional indexes can be added here if needed

// Virtuals
courseSchema.virtual("displayName").get(function () {
  return `${this.code} - ${this.name}`;
});

// Methods
courseSchema.methods.isActive = function () {
  return this.status === "Active";
};

// Static methods
courseSchema.statics.findActive = function () {
  return this.find({ status: "Active" });
};

// Pre-save: Normalize code
courseSchema.pre("save", function (next) {
  if (this.isModified("code")) {
    this.code = this.code.toUpperCase().trim();
  }
  next();
});

// ✅ CASCADE SOFT DELETE - When Course is set to Inactive, set dependent CourseStreamMappings to Inactive
courseSchema.pre("save", async function (next) {
  try {
    if (this.isModified("status") && this.status === "Inactive") {
      if (this.isNew || this.get("status") !== "Inactive") {
        let CourseStreamMapping;

        try {
          CourseStreamMapping = mongoose.model("CourseStreamMapping");
        } catch (err) {
          return next();
        }

        const result = await CourseStreamMapping.updateMany(
          { courseId: this._id, status: "Active" },
          { status: "Inactive" }
        );

        if (result.modifiedCount > 0) {
          console.log(
            `✅ Set ${result.modifiedCount} CourseStreamMapping(s) to Inactive for Course ${this._id}`
          );
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

courseSchema.pre(["findOneAndUpdate", "updateOne"], async function (next) {
  try {
    const update = this.getUpdate();
    if (update && (update.$set || update).status === "Inactive") {
      const filter = this.getFilter();
      const Course_data = mongoose.model("Course_data");
      const courses = await Course_data.find(filter).select("_id");

      const courseIds = courses.map((c) => c._id);

      if (courseIds.length > 0) {
        let CourseStreamMapping;

        try {
          CourseStreamMapping = mongoose.model("CourseStreamMapping");
        } catch (err) {
          return next();
        }

        await CourseStreamMapping.updateMany(
          { courseId: { $in: courseIds }, status: "Active" },
          { status: "Inactive" }
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Force remove old model definition
if (mongoose.models.Course_data) {
  delete mongoose.models.Course_data;
}

const Course = mongoose.model("Course_data", courseSchema);

module.exports = Course;
