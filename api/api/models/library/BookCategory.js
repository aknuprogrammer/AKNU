const mongoose = require("mongoose");

const bookCategorySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 10,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
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
bookCategorySchema.index({ code: 1 });
bookCategorySchema.index({ name: 1 });
bookCategorySchema.index({ status: 1 });
bookCategorySchema.index({ code: 1, status: 1 }); // Compound index for search

// Pre-save hook to update updatedAt
bookCategorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition (prevents re-compilation errors)
if (mongoose.models.BookCategory) {
  delete mongoose.models.BookCategory;
}

module.exports = mongoose.model("BookCategory", bookCategorySchema);

