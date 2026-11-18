// api/models/Event.js
const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    sno: { type: Number }, // optional serial number
    title: { type: String, required: true },
    description: { type: String, default: "" },

    // store dates & times separately for convenience,
    // or you could store as ISO datetimes instead.
    startDate: { type: String, required: true }, // e.g. "2025-09-20"
    startTime: { type: String, required: true }, // e.g. "14:30"
    endDate: { type: String, required: true },   // e.g. "2025-09-20"
    endTime: { type: String, required: true },   // e.g. "17:00"

    // optional fields
    location: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true // adds createdAt and updatedAt
  }
);

// avoid OverwriteModelError in serverless/hot-reload envs:
module.exports = mongoose.models.Event || mongoose.model("DatePicker", EventSchema);
