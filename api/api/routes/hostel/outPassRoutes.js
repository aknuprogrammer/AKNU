const express = require("express");
const { getOutPasses, createOutPass, approveOutPass } = require("../../controllers/hostel/outPassController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

router.use(authenticationMiddleware);

router.get("/", getOutPasses);
router.post("/", createOutPass);
router.patch("/:id/approve", approveOutPass);

module.exports = router;
