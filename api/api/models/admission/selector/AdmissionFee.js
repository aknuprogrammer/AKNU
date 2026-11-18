const mongoose = require("mongoose");


const admissionFeeSchema = new mongoose.Schema({
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Course_data", 
    required: true 
  },
  campusId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "College", // replace with your campus/college collection name
    required: true 
  },
  mode: String,
  years: [
    {
      year: Number,
      fees: [
        {
          feeType: String,
          feeAmount: Number,
          remarks: String
        }
      ]
    }
  ]
});

module.exports = mongoose.model("AdmissionFee", admissionFeeSchema);
