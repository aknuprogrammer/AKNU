const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    RegisterNumber: { type: mongoose.Schema.Types.Mixed, required: true },
    StudentName: { type: String, required: true },
    CourseName: { type: String, required: true },
    
   Semester: { type: String },
    SubjectName: { type: String, required: true },
    Grade: { type: String, required: true },
    SubjectOrder: { type: Number },
    batchId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "ResultBatch",
      required: true,
    },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

resultSchema.index({ RegisterNumber: 1 });
resultSchema.index({ batchId: 1 });
resultSchema.index({ RegisterNumber: 1, batchId: 1 });

resultSchema.index(
  {
    StudentName: 1,
    RegisterNumber: 1,
    CourseName: 1,
    Semester: 1,
    SubjectName: 1,
    batchId: 1,
  },
  { unique: true }
);

module.exports =
  mongoose.models.Result || mongoose.model("Result", resultSchema);
