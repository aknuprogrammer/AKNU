const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    shortCode: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const DepartmentModal = mongoose.model("departments", schema);
module.exports = DepartmentModal;
