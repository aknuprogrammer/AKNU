const express = require("express");
const router = express.Router();
const communicationController = require("../../../controllers/admission/selector/admissionCommunicationController");

router.post("/", communicationController.createCommunication);
router.get("/", communicationController.getCommunications);

module.exports = router;
