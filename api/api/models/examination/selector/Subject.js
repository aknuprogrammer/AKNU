const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    maxlength: 250,
    trim: true,
  },
  syllabus: {
    type: String,
    required: true,
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
subjectSchema.index({ status: 1 });

// Update timestamp before saving
subjectSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// ✅ CASCADE SOFT DELETE - When Subject is set to Inactive, set dependent records to Inactive
subjectSchema.pre("save", async function (next) {
  try {
    if (this.isModified("status") && this.status === "Inactive") {
      if (this.isNew || this.get("status") !== "Inactive") {
        // Cascade soft delete for CourseStreamMapping (nested in subjects array)
        let CourseStreamMapping;
        try {
          CourseStreamMapping = mongoose.model("CourseStreamMapping");
          const result1 = await CourseStreamMapping.updateMany(
            { "subjects.subjectId": this._id, status: "Active" },
            { status: "Inactive" }
          );
          if (result1.modifiedCount > 0) {
            console.log(
              `✅ Set ${result1.modifiedCount} CourseStreamMapping(s) to Inactive for Subject ${this._id}`
            );
          }
        } catch (err) {
          // Model not loaded, skip
        }

        // Cascade soft delete for TimetableEntry
        let TimetableEntry;
        try {
          TimetableEntry = mongoose.model("TimetableEntry");
          const result2 = await TimetableEntry.updateMany(
            { subjectId: this._id, status: "Active" },
            { status: "Inactive" }
          );
          if (result2.modifiedCount > 0) {
            console.log(
              `✅ Set ${result2.modifiedCount} TimetableEntry(s) to Inactive for Subject ${this._id}`
            );
          }
        } catch (err) {
          // Model not loaded, skip
        }

        // Cascade soft delete for StreamSubjectMapping
        let StreamSubjectMapping;
        try {
          StreamSubjectMapping = mongoose.model("StreamSubjectMapping");
          const result3 = await StreamSubjectMapping.updateMany(
            { subjectId: this._id, status: "Active" },
            { status: "Inactive" }
          );
          if (result3.modifiedCount > 0) {
            console.log(
              `✅ Set ${result3.modifiedCount} StreamSubjectMapping(s) to Inactive for Subject ${this._id}`
            );
          }
        } catch (err) {
          // Model not loaded, skip
        }

        // Cascade soft delete for Professor (remove subject from subjectIds array or set to Inactive)
        let Professor;
        try {
          Professor = mongoose.model("Professor");
          // Update professors that have this subject in their subjectIds array
          const professors = await Professor.find({
            subjectIds: this._id,
            status: "Active",
          });
          for (const professor of professors) {
            // Remove the subject from subjectIds array
            professor.subjectIds = professor.subjectIds.filter(
              (id) => id.toString() !== this._id.toString()
            );
            // If no subjects left, set professor to Inactive
            if (professor.subjectIds.length === 0) {
              professor.status = "Inactive";
            }
            await professor.save();
          }
          if (professors.length > 0) {
            console.log(
              `✅ Updated ${professors.length} Professor(s) for Subject ${this._id}`
            );
          }
        } catch (err) {
          // Model not loaded, skip
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

subjectSchema.pre(["findOneAndUpdate", "updateOne"], async function (next) {
  try {
    const update = this.getUpdate();
    if (update && (update.$set || update).status === "Inactive") {
      const filter = this.getFilter();
      const Subject = mongoose.model("Subject");
      const subjects = await Subject.find(filter).select("_id");

      const subjectIds = subjects.map((s) => s._id);

      if (subjectIds.length > 0) {
        // Cascade soft delete for CourseStreamMapping
        let CourseStreamMapping;
        try {
          CourseStreamMapping = mongoose.model("CourseStreamMapping");
          await CourseStreamMapping.updateMany(
            { "subjects.subjectId": { $in: subjectIds }, status: "Active" },
            { status: "Inactive" }
          );
        } catch (err) {
          // Model not loaded, skip
        }

        // Cascade soft delete for TimetableEntry
        let TimetableEntry;
        try {
          TimetableEntry = mongoose.model("TimetableEntry");
          await TimetableEntry.updateMany(
            { subjectId: { $in: subjectIds }, status: "Active" },
            { status: "Inactive" }
          );
        } catch (err) {
          // Model not loaded, skip
        }

        // Cascade soft delete for StreamSubjectMapping
        let StreamSubjectMapping;
        try {
          StreamSubjectMapping = mongoose.model("StreamSubjectMapping");
          await StreamSubjectMapping.updateMany(
            { subjectId: { $in: subjectIds }, status: "Active" },
            { status: "Inactive" }
          );
        } catch (err) {
          // Model not loaded, skip
        }

        // Cascade soft delete for Professor
        let Professor;
        try {
          Professor = mongoose.model("Professor");
          const professors = await Professor.find({
            subjectIds: { $in: subjectIds },
            status: "Active",
          });
          for (const professor of professors) {
            professor.subjectIds = professor.subjectIds.filter(
              (id) => !subjectIds.some((sid) => sid.toString() === id.toString())
            );
            if (professor.subjectIds.length === 0) {
              professor.status = "Inactive";
            }
            await professor.save();
          }
        } catch (err) {
          // Model not loaded, skip
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Force remove old model definition
if (mongoose.models.Subject) {
  delete mongoose.models.Subject;
}

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;

