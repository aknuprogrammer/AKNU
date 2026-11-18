const mongoose = require("mongoose");

const streamSubjectMappingSchema = new mongoose.Schema({
  streamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stream",
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  notes: {
    type: String,
    maxlength: 250,
    trim: true,
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
streamSubjectMappingSchema.index({ streamId: 1 });
streamSubjectMappingSchema.index({ subjectId: 1 });
streamSubjectMappingSchema.index({ status: 1 });
// Compound unique index to prevent duplicate stream-subject mappings
streamSubjectMappingSchema.index({ streamId: 1, subjectId: 1 }, { unique: true });

// Update timestamp before saving
streamSubjectMappingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.StreamSubjectMapping) {
  delete mongoose.models.StreamSubjectMapping;
}

const StreamSubjectMapping = mongoose.model(
  "StreamSubjectMapping",
  streamSubjectMappingSchema
);

module.exports = StreamSubjectMapping;

