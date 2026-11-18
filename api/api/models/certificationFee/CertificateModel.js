const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  regd: { type: String, required: true },
  name: { type: String, required: true },
  course: { type: String, required: true },
  college: { type: String, required: true },
  pass_month: String,
  pass_year: String,
  admit_year: String,
  dob: String,
  purpose: String,
  app_type: { type: String, default: 'normal' },
  amount: { type: Number, default: 0 },
  address: String,
  phone: String,
  email: String,
  insert_date: { type: Date, default: Date.now },
  reference_no: { type: String, unique: true },
  payment_status: { type: String, default: 'Pending' },
  sets: { type: String, default: '1' },
  papers: { type: String, default: '0' },
  semester: String
});

module.exports = mongoose.model('Certificate', certificateSchema);