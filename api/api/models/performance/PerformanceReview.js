const mongoose = require("mongoose");

const PerformanceReviewSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String, // Referencing employeeId string from EmployeeRegistration
      required: true,
      ref: "EmployeeRegistration", // Although it's a string, we can logically link it
    },
    employeeObjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmployeeRegistration",
        required: true
    },
    cycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PerformanceCycle",
      required: true,
    },
    
    // Employee Section
    selfAssessment: {
      // New Repeated Sections
      certificates: [
        {
          title: { type: String },
          date: { type: String },
          description: { type: String },
          proofs: [{ url: { type: String }, name: { type: String } }],
          adminData: {
             isVerified: { type: Boolean, default: false },
             weight: { type: Number, default: 0 },
             isLocked: { type: Boolean, default: false },
             remarks: { type: String }
          }
        }
      ],
      awards: [
          {
            title: { type: String },
            date: { type: String },
            description: { type: String },
            proofs: [{ url: { type: String }, name: { type: String } }],
            adminData: {
               isVerified: { type: Boolean, default: false },
               weight: { type: Number, default: 0 },
               isLocked: { type: Boolean, default: false },
               remarks: { type: String }
            }
          }
      ],
      eventsOrganized: [
          {
              title: { type: String },
              date: { type: String }, // Keeping as string for flexibility or Date
              description: { type: String },
              proofs: [{ url: { type: String }, name: { type: String } }],
              adminData: {
                 isVerified: { type: Boolean, default: false },
                 weight: { type: Number, default: 0 },
                 isLocked: { type: Boolean, default: false },
                 remarks: { type: String }
              }
          }
      ],
      eventsAttended: [
          {
              title: { type: String },
              date: { type: String },
              description: { type: String },
              proofs: [{ url: { type: String }, name: { type: String } }],
              adminData: {
                 isVerified: { type: Boolean, default: false },
                 weight: { type: Number, default: 0 },
                 isLocked: { type: Boolean, default: false },
                 remarks: { type: String }
              }
          }
      ],
      publications: [
          {
              title: { type: String },
              date: { type: String },
              description: { type: String }, // or link
              proofs: [{ url: { type: String }, name: { type: String } }],
              adminData: {
                 isVerified: { type: Boolean, default: false },
                 weight: { type: Number, default: 0 },
                 isLocked: { type: Boolean, default: false },
                 remarks: { type: String }
              }
          }
      ],
      
      submissionDate: { type: Date },
    },

    // Manager Section
    managerAssessment: {
      reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      ratings: {
        param1: { type: Number, min: 1, max: 5 }, // e.g., Technical Skills
        param2: { type: Number, min: 1, max: 5 }, // e.g., Communication
        param3: { type: Number, min: 1, max: 5 }, // e.g., Leadership
        overall: { type: Number, min: 1, max: 5 },
      },
      hikePercentage: { type: Number, default: 0 },
      bonusPercentage: { type: Number, default: 0 },
      promotion: {
        recommended: { type: Boolean, default: false },
        newTitle: { type: String },
      },
      approvalStatus: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
      remarks: { type: String },
      reviewDate: { type: Date },
    },

    status: {
      type: String,
      enum: ["Draft", "Submitted", "UnderReview", "Completed", "Locked"],
      default: "Draft",
    },
  },
  { timestamps: true }
);

// Ensure one review per employee per cycle
PerformanceReviewSchema.index({ employeeId: 1, cycleId: 1 }, { unique: true });

module.exports = mongoose.model("PerformanceReview", PerformanceReviewSchema);
