const mongoose = require('mongoose');

const alumniRegistrationFormSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  passOutYear: { type: Number, required: true },
  branch: { type: String, required: true },
  email: { type: String, required: true },
  currentOccupation: { type: String, required: true },
  college: String,
  phone: String,
  address1: String,
  address2: String,
  city: String,
  state: String,
  country: String,
  photo: { type: Buffer }, // store image as binary
  photoContentType: String, // store MIME type (image/jpeg, image/png)
  description: String,
  currentDesignation: String,
  currentCompany: String,
  highestQualification: String,
  terms: Boolean,
  // NEW FIELDS
  username: { type:String, unique: true },
  password: String,
  reg_no: String,
}, { timestamps: true });

module.exports = mongoose.model('AlumniRegistrationForm', alumniRegistrationFormSchema);
