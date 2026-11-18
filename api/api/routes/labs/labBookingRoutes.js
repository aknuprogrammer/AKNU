const express = require("express");
const {
  getLabBookings,
  getLabBookingById,
  createLabBooking,
  updateLabBooking,
  deleteLabBooking,
} = require("../../controllers/labs/labBookingController");
const router = express.Router();

router.get("/", getLabBookings);
router.post("/", createLabBooking);
router.get("/:id", getLabBookingById);
router.put("/:id", updateLabBooking);
router.delete("/:id", deleteLabBooking);

module.exports = router;
