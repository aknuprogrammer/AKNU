const mongoose = require("mongoose");

const HiringNotificationSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    requiredExperience: {
      type: String,
      required: true,
      trim: true,
    },
    requiredSkills: {
      type: String,
      required: true,
      trim: true,
    },
    openings: {
      type: String,
      required: true,
    },
    applicationDeadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "Closed", "Archived"],
      default: "Closed",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    publishedJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Model_Jobs"
    }
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.HiringNotification ||
  mongoose.model("HiringNotification", HiringNotificationSchema, "hiring_notifications");
