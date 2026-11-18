const express = require("express");
const { getAllFees, createFee, updateFee, deleteFee } = require("../../../controllers/admission/selector/otherFeesController");
const router = express.Router();

// Routes
router.get("/", getAllFees);
router.post("/", createFee);
router.put("/:id", updateFee);
router.delete("/:id", deleteFee);

module.exports = router;
