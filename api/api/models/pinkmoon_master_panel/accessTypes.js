// models/pinkmoon_master_panel/accessTypes.js

const mongoose = require('mongoose');

const accessTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Access type name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Access type name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  permissions: [{
    type: String,
    enum: [
      'read',
      'write',
      'delete',
      'manage_users',
      'manage_content',
      'view_reports',
      'export_data',
      'import_data',
      'configure_settings'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add pagination plugin if needed
if (!accessTypeSchema.plugins) {
  accessTypeSchema.plugins = [];
}

// Add text index for search functionality
accessTypeSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('AccessType', accessTypeSchema);