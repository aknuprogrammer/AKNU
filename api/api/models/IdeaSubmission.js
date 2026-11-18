const mongoose = require("mongoose");

const IdeaSubmissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    college: {
      type: String,
      required: true,
    },
    addr: {
      type: String,
      required: true,
    },
    idea: {
      data: Buffer,
      contentType: String,
      originalName: String,
    },
    agree: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("IdeaSubmission", IdeaSubmissionSchema);
