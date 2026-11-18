const express = require("express");
const { createPaymentOrder } = require("../../controllers/paymentController.js");

const router = express.Router();

router.post("/order", createPaymentOrder);

module.exports = router;
