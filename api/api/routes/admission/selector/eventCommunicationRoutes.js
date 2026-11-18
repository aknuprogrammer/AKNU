const express = require("express");
const {
  getEventCommunications,
  createEventCommunication,
  getEventCommunicationById,
  deleteEventCommunication,
} = require("../../../controllers/admission/selector/eventCommunicationController");

const router = express.Router();

router.get("/", getEventCommunications);
router.post("/", createEventCommunication);
router.get("/:id", getEventCommunicationById);
router.delete("/:id", deleteEventCommunication);

module.exports = router;
