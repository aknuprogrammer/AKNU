const mongoose = require("mongoose");

const wardenSchema = new mongoose.Schema(
  {
    wardenId: {
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
      maxlength: 200,
      index: true,
    },
    designation: {
      type: String,
      required: true,
      enum: ["Chief Warden", "Assistant Warden", "Deputy Warden"],
      default: "Chief Warden",
      index: true,
    },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: false, // Optional - can be assigned from hostel side
      index: true,
    },
    hostelName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    alternatePhone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
      default: "",
    },
    address: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    qualification: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    experience: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    joiningDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    responsibilities: {
      type: [String],
      default: [],
      enum: [
        "Hostel Administration",
        "Student Welfare",
        "Discipline",
        "Security",
        "Maintenance",
        "Mess Management",
        "Fee Collection",
        "Attendance",
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
wardenSchema.index({ wardenId: 1 });
wardenSchema.index({ hostelId: 1 });
wardenSchema.index({ designation: 1 });
wardenSchema.index({ status: 1 });
wardenSchema.index({ email: 1 });
wardenSchema.index({ hostelId: 1, status: 1 }); // Compound index for filtering

// Pre-save hook to update updatedAt
wardenSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for getting warden details with populated hostel
wardenSchema.virtual("hostel", {
  ref: "Hostel",
  localField: "hostelId",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtuals are included in JSON output
wardenSchema.set("toJSON", { virtuals: true });
wardenSchema.set("toObject", { virtuals: true });

// Force remove old model definition (prevents re-compilation errors)
if (mongoose.models.Warden) {
  delete mongoose.models.Warden;
}

module.exports = mongoose.model("Warden", wardenSchema);

