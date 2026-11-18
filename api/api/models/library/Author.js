const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    authorCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    alternativeNames: {
      type: [String],
      default: [],
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    website: {
      type: String,
      trim: true,
      maxlength: 500,
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional field
          return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v);
        },
        message: "Please enter a valid URL",
      },
    },
    specialization: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
authorSchema.index({ authorCode: 1 });
authorSchema.index({ name: 1 });
authorSchema.index({ status: 1 });
authorSchema.index({ name: 1, status: 1 }); // Compound index for search
authorSchema.index({ alternativeNames: 1 }); // Index for searching alternative names

// Pre-save hook to update updatedAt
authorSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition (prevents re-compilation errors)
if (mongoose.models.Author) {
  delete mongoose.models.Author;
}

module.exports = mongoose.model("Author", authorSchema);

