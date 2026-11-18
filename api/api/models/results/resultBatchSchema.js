const mongoose = require("mongoose");

const resultBatchSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      enum: ["UG", "PG", "OTHER"],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    resultDate: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["regular", "rv","rANDb"],
      default: "regular",
    },
    semester: {
      type: Number,
      min: 1,
      max: 16,
      // required: function () {
      //   return this.level === "UG" || this.level === "PG";
      // },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

resultBatchSchema.index({ level: 1, title: 1, resultDate: 1 });

module.exports =
  mongoose.models.ResultBatch ||
  mongoose.model("ResultBatch", resultBatchSchema);
