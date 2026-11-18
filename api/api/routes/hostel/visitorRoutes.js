const express = require("express");
const router = express.Router();
const visitorController = require("../../controllers/hostel/visitorController");
const authenticationMiddleware = require("../../middlewares/authentication");

router.use(authenticationMiddleware);

router.get("/lookup/:registrationNumber", visitorController.lookupStudent);
router.get("/", visitorController.getAllVisitors);
router.post("/", visitorController.registerVisitor);
router.patch("/:id/checkout", visitorController.checkoutVisitor);

module.exports = router;
