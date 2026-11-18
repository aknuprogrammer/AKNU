const express = require("express");
const {
  getFeePendingCommunications,
  createFeePendingCommunication,
  getFeePendingCommunicationById,
  deleteFeePendingCommunication,
} = require("../../../controllers/admission/selector/feePendingCommunicationController");

const router = express.Router();

router.get("/", getFeePendingCommunications);
router.post("/", createFeePendingCommunication);
router.get("/:id", getFeePendingCommunicationById);
router.delete("/:id", deleteFeePendingCommunication);

module.exports = router;
