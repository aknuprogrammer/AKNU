const mongoose = require('mongoose');

const applicationPurposeSchema = new mongoose.Schema({
  purpose_code: { type: String, required: true, unique: true },
  purpose: { type: String, required: true },
  fee: { type: Number, required: true },
  belated_fee: { type: Number, required: true },
  revised_rate_year: { type: Number },
  required_docs: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('ApplicationPurpose', applicationPurposeSchema);