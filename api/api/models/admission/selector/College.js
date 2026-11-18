const mongoose = require("mongoose");

/**
 * College Schema
 * 
 * This schema represents colleges/campuses in the system.
 * Uses foreign key references for collegeType, collegeCategory, and courseCategory.
 * 
 * API Endpoints:
 * GET    /api/colleges_data                    - Get all colleges
 * GET    /api/colleges_data/:id                - Get college by ID
 * POST   /api/colleges_data                    - Create new college
 * PUT    /api/colleges_data/:id                - Update college
 * DELETE /api/colleges_data/:id                - Delete college
 */
const collegeSchema = new mongoose.Schema(
  {
    // Basic Information
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Address Information
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine2: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\d{6}$/.test(v);
        },
        message: "Pincode must be exactly 6 digits",
      },
    },

    // Classification - Using Foreign Key References
    collegeTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollegeType",
      required: true,
      index: true,
    },

    collegeCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollegeCategory",
      required: true,
      index: true,
    },

    courseCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollegeOtherCategory",
      required: true,
      index: true,
      // References collegeOtherCategories collection
    },

    // Additional Information
    comments: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "",
    },

    // Status
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    collection: "colleges",
  }
);

// Indexes for common queries
// Note: code, name, and status already have indexes from field definitions
collegeSchema.index({ city: 1, district: 1, state: 1 });
collegeSchema.index({ collegeTypeId: 1, collegeCategoryId: 1 });

// Compound index for search
collegeSchema.index({
  name: "text",
  code: "text",
  city: "text",
  district: "text",
});

// Virtual for full address
collegeSchema.virtual("fullAddress").get(function () {
  const parts = [
    this.addressLine1,
    this.addressLine2,
    this.city,
    this.district,
    this.state,
    this.pincode,
  ].filter(Boolean);
  return parts.join(", ");
});

// Method to get formatted college info
collegeSchema.methods.getFormattedInfo = function () {
  return {
    code: this.code,
    name: this.name,
    address: this.fullAddress,
    type: this.collegeTypeId?.name || this.collegeTypeId,
    category: this.collegeCategoryId?.name || this.collegeCategoryId,
    otherCategory: this.courseCategoryId?.name || this.courseCategoryId,
    status: this.status,
  };
};

// Static method to find by location
collegeSchema.statics.findByLocation = function (city, district, state) {
  const query = {};
  if (city) query.city = city;
  if (district) query.district = district;
  if (state) query.state = state;
  return this.find(query).populate(
    "collegeTypeId collegeCategoryId courseCategoryId"
  );
};

// Static method to find by type and category
collegeSchema.statics.findByClassification = function (
  collegeTypeId,
  collegeCategoryId,
  courseCategoryId
) {
  const query = {};
  if (collegeTypeId) query.collegeTypeId = collegeTypeId;
  if (collegeCategoryId) query.collegeCategoryId = collegeCategoryId;
  if (courseCategoryId) query.courseCategoryId = courseCategoryId;
  return this.find(query).populate(
    "collegeTypeId collegeCategoryId courseCategoryId"
  );
};

// Force remove old model definition
if (mongoose.models.College) {
  delete mongoose.models.College;
}

const College = mongoose.model("College", collegeSchema);

module.exports = College;
