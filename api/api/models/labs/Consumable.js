const mongoose = require("mongoose");

const consumableSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      default: "units",
    },
    threshold: {
      type: Number,
      min: 0,
      default: 10,
    },
    assignedLab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      index: true,
    },
    purchaseDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    vendor: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    price: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
consumableSchema.index({ assignedLab: 1 });
consumableSchema.index({ status: 1 });
consumableSchema.index({ name: 1, category: 1 });

// Pre-save hook to update updatedAt
consumableSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.Consumable) {
  delete mongoose.models.Consumable;
}

module.exports = mongoose.model("Consumable", consumableSchema);
