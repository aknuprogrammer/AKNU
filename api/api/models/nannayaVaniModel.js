const mongoose = require('mongoose');

const nannayaVaniSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Publication date is required']
  },
  edition: {
    type: String,
    required: [true, 'Edition number is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^Edition #\d+$/.test(v);
      },
      message: props => `${props.value} is not a valid edition format (should be "Edition #<number>")`
    }
  },
  pdfData: {
    type: Buffer,
    required: true
  },
  contentType: {
    type: String,
    required: true,
    enum: ['application/pdf']
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

// Indexes for better query performance
nannayaVaniSchema.index({ date: 1 });

// Add virtuals and methods as needed
module.exports = mongoose.model('NannayaVani', nannayaVaniSchema);