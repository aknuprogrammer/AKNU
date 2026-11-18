// models/Module.js
const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },

    // Instead of enum string, store reference to AccessType
    accessType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccessType",   // reference your AccessType collection
      required: true,
    },

    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// ✅ Index for faster search
moduleSchema.index({ name: 1 });

module.exports = mongoose.model("Module", moduleSchema);
