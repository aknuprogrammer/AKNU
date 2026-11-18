const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  logo: {
    type: String,
    required: true,
  },
});

const UniversityModal = mongoose.model("universities", schema);
module.exports = UniversityModal;
