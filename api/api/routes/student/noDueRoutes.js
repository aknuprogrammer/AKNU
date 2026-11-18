const express = require("express");
const router = express.Router();
const noDueController = require("../../controllers/student/noDueController");

router.get("/:id", noDueController.getNoDueStatus);

module.exports = router;
