const mongoose = require("mongoose");

const issuedBookSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },
    borrowerType: {
      type: String,
      enum: ["student", "faculty"],
      required: true,
      index: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      // This can reference either Student or Professor based on borrowerType
      // We'll use a dynamic reference or store as generic ObjectId
    },
    borrowerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    borrowerEmail: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    borrowerPhone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["issued", "returned", "overdue", "renewed"],
      default: "issued",
      required: true,
      index: true,
    },
    fineAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    renewals: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxRenewals: {
      type: Number,
      default: 2, // Default for students, will be set based on borrower type and rules
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
issuedBookSchema.index({ book: 1, status: 1 });
issuedBookSchema.index({ borrower: 1, borrowerType: 1 });
issuedBookSchema.index({ dueDate: 1, status: 1 });
issuedBookSchema.index({ issueDate: -1 });

// Virtual to check if book is overdue
issuedBookSchema.virtual("isOverdue").get(function () {
  if (this.status === "returned") return false;
  return this.dueDate < new Date();
});

// Pre-save middleware to update status to overdue if due date passed
issuedBookSchema.pre("save", function (next) {
  if (this.status === "issued" && this.dueDate < new Date() && !this.returnDate) {
    this.status = "overdue";
  }
  next();
});

// Method to calculate fine (if needed)
issuedBookSchema.methods.calculateFine = function (finePerDay = 5) {
  if (this.status === "returned" || !this.isOverdue) return 0;
  const daysOverdue = Math.ceil(
    (new Date() - this.dueDate) / (1000 * 60 * 60 * 24)
  );
  return daysOverdue * finePerDay;
};

const IssuedBook = mongoose.model("IssuedBook", issuedBookSchema);

module.exports = IssuedBook;

