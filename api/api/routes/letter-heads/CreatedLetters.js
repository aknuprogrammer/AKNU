const express = require("express");
const router = express.Router();
const letterController = require("../controllers/letterController");
const authenticationMiddleware = require("../../middlewares/authentication");

// Middleware to handle large JSON payloads
router.use(express.json({ limit: "20mb" })); // Increase if needed
router.use(express.urlencoded({ limit: "20mb", extended: true }));

// Create letter
router.post(
  "/letters",
  authenticationMiddleware,
  letterController.createLetter
);

// Get all letters
router.get("/letters", letterController.getAllLetters);

// Get letter by refNo
router.get("/letters/:refNo", letterController.getLetterByRef);

// Get letter by ID
router.get("/letters/:id", letterController.getLetterById);

module.exports = router;
