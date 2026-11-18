const mongoose = require("mongoose");

const rvResultSchema = new mongoose.Schema(
  {
    RegisterNumber: { type: mongoose.Schema.Types.Mixed, required: true },
    CourseName: { type: String, required: true },

    Semester: { type: String },
    SubjectName: { type: String, required: true },
    Grade: { type: String, required: true },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResultBatch",
      required: true,
    },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

rvResultSchema.index({ RegisterNumber: 1 });
rvResultSchema.index({ batchId: 1 });
rvResultSchema.index({ RegisterNumber: 1, batchId: 1 });

rvResultSchema.index(
  {
    RegisterNumber: 1,
    CourseName: 1,
    Semester: 1,
    SubjectName: 1,
    batchId: 1,
  },
  { unique: true }
);

module.exports =
  mongoose.models.RVResult || mongoose.model("RVResult", rvResultSchema);
