const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  college_code: {
    type: String,
    required: true,
    maxlength: 15
  },
  college_name: {
    type: String,
    required: true,
    maxlength: 205
  },
  location: {
    type: String,
    required: true,
    maxlength: 325
  },
  type: {
    type: String,
    maxlength: 45
  }
}, { timestamps: true });

module.exports = mongoose.model('College', collegeSchema);