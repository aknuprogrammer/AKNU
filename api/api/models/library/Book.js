const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    bookTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
      index: true,
    },
    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Publisher",
      required: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookCategory",
      required: true,
      index: true,
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
      index: true,
    },
    edition: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    shelfLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LibraryRack",
      required: true,
      index: true,
    },
    publicationYear: {
      type: Number,
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional field
          const currentYear = new Date().getFullYear();
          return v >= 1000 && v <= currentYear + 1; // Allow next year for pre-orders
        },
        message: "Publication year must be between 1000 and current year + 1",
      },
    },
    bookImage: {
      type: String,
      trim: true,
      // Base64 images can be very long, so we allow up to 2MB of base64 data (~2.6M chars)
      // For now, we'll allow large base64 strings, but ideally images should be stored as files
      maxlength: 3000000,
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalCopies: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    availableCopies: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: {
        validator: function (v) {
          return v <= this.totalCopies;
        },
        message: "Available copies cannot exceed total copies",
      },
    },
    status: {
      type: String,
      enum: ["available", "unavailable", "maintenance"],
      default: "available",
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
bookSchema.index({ bookTitle: 1 });
bookSchema.index({ isbn: 1 });
bookSchema.index({ status: 1 });
bookSchema.index({ author: 1, publisher: 1 });
bookSchema.index({ category: 1, status: 1 });
bookSchema.index({ shelfLocation: 1 });
bookSchema.index({ bookTitle: 1, isbn: 1 }); // Compound index for search

// Virtual for issued copies (calculated field)
bookSchema.virtual("issuedCopies").get(function () {
  return this.totalCopies - this.availableCopies;
});

// Ensure virtual fields are serialized
bookSchema.set("toJSON", { virtuals: true });
bookSchema.set("toObject", { virtuals: true });

// Pre-save hook to update availableCopies if totalCopies changes
bookSchema.pre("save", function (next) {
  if (this.isModified("totalCopies")) {
    // If totalCopies is reduced, adjust availableCopies
    if (this.availableCopies > this.totalCopies) {
      this.availableCopies = this.totalCopies;
    }
  }
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition (prevents re-compilation errors)
if (mongoose.models.Book) {
  delete mongoose.models.Book;
}

module.exports = mongoose.model("Book", bookSchema);

