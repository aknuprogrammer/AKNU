const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course_data",
    required: true,
  },
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
streamSchema.index({ courseId: 1 });
streamSchema.index({ status: 1 });

// Update timestamp before saving
streamSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// ✅ CASCADE SOFT DELETE - When Stream is set to Inactive, set dependent records to Inactive
streamSchema.pre("save", async function (next) {
  try {
    if (this.isModified("status") && this.status === "Inactive") {
      if (this.isNew || this.get("status") !== "Inactive") {
        // Cascade soft delete for CourseStreamMapping
        let CourseStreamMapping;
        try {
          CourseStreamMapping = mongoose.model("CourseStreamMapping");
          const result1 = await CourseStreamMapping.updateMany(
            { streamId: this._id, status: "Active" },
            { status: "Inactive" }
          );
          if (result1.modifiedCount > 0) {
            console.log(
              `✅ Set ${result1.modifiedCount} CourseStreamMapping(s) to Inactive for Stream ${this._id}`
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
            { streamId: this._id, status: "Active" },
            { status: "Inactive" }
          );
          if (result2.modifiedCount > 0) {
            console.log(
              `✅ Set ${result2.modifiedCount} TimetableEntry(s) to Inactive for Stream ${this._id}`
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
            { streamId: this._id, status: "Active" },
            { status: "Inactive" }
          );
          if (result3.modifiedCount > 0) {
            console.log(
              `✅ Set ${result3.modifiedCount} StreamSubjectMapping(s) to Inactive for Stream ${this._id}`
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

streamSchema.pre(["findOneAndUpdate", "updateOne"], async function (next) {
  try {
    const update = this.getUpdate();
    if (update && (update.$set || update).status === "Inactive") {
      const filter = this.getFilter();
      const Stream = mongoose.model("Stream");
      const streams = await Stream.find(filter).select("_id");

      const streamIds = streams.map((s) => s._id);

      if (streamIds.length > 0) {
        // Cascade soft delete for CourseStreamMapping
        let CourseStreamMapping;
        try {
          CourseStreamMapping = mongoose.model("CourseStreamMapping");
          await CourseStreamMapping.updateMany(
            { streamId: { $in: streamIds }, status: "Active" },
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
            { streamId: { $in: streamIds }, status: "Active" },
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
            { streamId: { $in: streamIds }, status: "Active" },
            { status: "Inactive" }
          );
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
if (mongoose.models.Stream) {
  delete mongoose.models.Stream;
}

const Stream = mongoose.model("Stream", streamSchema);

module.exports = Stream;

