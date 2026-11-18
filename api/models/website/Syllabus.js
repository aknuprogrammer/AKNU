const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
  program: {
    type: String,
    required: true,
    enum: ['UG', 'PG', 'Pre-PhD']
  },
  effectiveYear: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  title: {
    type: String, // Subject Name
    required: true
  },
  // Supporting multiple syllabuses for a single subject
  files: [
    {
      title: { type: String, default: "Syllabus" }, // e.g. "Theory", "Lab", "Revised"
      pdfPath: { type: String, required: true },
      fileName: String,
      fileSize: Number
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexing for faster grouping and sorting on the website
syllabusSchema.index({ program: 1, effectiveYear: -1, category: 1 });

module.exports = mongoose.model('Syllabus', syllabusSchema);
