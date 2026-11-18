const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema({
  numberOfSemesters: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
  }, // e.g., 1, 2, 3, 4, 5, 6, 7, 8
  description: {
    type: String,
    maxlength: 250,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
semesterSchema.index({ status: 1 });
semesterSchema.index({ numberOfSemesters: 1 });

// Update timestamp before saving
semesterSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// ✅ CASCADE SOFT DELETE - When Semester is set to Inactive, set dependent CourseStreamMappings to Inactive
semesterSchema.pre("save", async function (next) {
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
          { semesterId: this._id, status: "Active" },
          { status: "Inactive" }
        );

        if (result.modifiedCount > 0) {
          console.log(
            `✅ Set ${result.modifiedCount} CourseStreamMapping(s) to Inactive for Semester ${this._id}`
          );
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

semesterSchema.pre(["findOneAndUpdate", "updateOne"], async function (next) {
  try {
    const update = this.getUpdate();
    if (update && (update.$set || update).status === "Inactive") {
      const filter = this.getFilter();
      const Semester = mongoose.model("Semester");
      const semesters = await Semester.find(filter).select("_id");

      const semesterIds = semesters.map((s) => s._id);

      if (semesterIds.length > 0) {
        let CourseStreamMapping;

        try {
          CourseStreamMapping = mongoose.model("CourseStreamMapping");
        } catch (err) {
          return next();
        }

        await CourseStreamMapping.updateMany(
          { semesterId: { $in: semesterIds }, status: "Active" },
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
if (mongoose.models.Semester) {
  delete mongoose.models.Semester;
}

const Semester = mongoose.model("Semester", semesterSchema);

module.exports = Semester;

