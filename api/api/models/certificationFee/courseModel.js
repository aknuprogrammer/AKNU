const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  coursecode: {
    type: String,
    required: true,
    maxlength: 15
  },
  coursename: {
    type: String,
    required: true,
    maxlength: 155
  },
  duration: {
    type: String,
    maxlength: 15
  },
  fee_code: {
    type: String,
    maxlength: 45
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);