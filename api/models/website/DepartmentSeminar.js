const mongoose = require('mongoose');

const departmentSeminarSchema = new mongoose.Schema({
  college: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  majorEvent: {
    type: String,
    required: true
  },
  period: {
    type: String,
    required: true
  },
  note: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

departmentSeminarSchema.index({ college: 1, department: 1 });

module.exports = mongoose.model('DepartmentSeminar', departmentSeminarSchema);
