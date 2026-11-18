const express = require("express");

const {
  getColleges,
  getCollege,
  createCollege,
  updateCollege,
  deleteCollege,
  getCollegesByStatus,
} = require("../../controllers/pinkmoon_master_panel/collegeController");

const router = express.Router();

router.route("/").get(getColleges).post(createCollege);

router.route("/:id").get(getCollege).put(updateCollege).delete(deleteCollege);

router.route("/status/:status").get(getCollegesByStatus);

module.exports = router;
