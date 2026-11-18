const express = require("express");
const multer = require("multer");
const {
  createLetter,
  deleteLetter,
  getLetterFile,
  getLetters,
  getLetterMetadata,
} = require("../controllers/letter-head/letterController");
const {
  createLetterRequest,
  getLetterRequests,
  getLetterRequestById,
  deleteLetterRequest,
  approveLetterRequest,
  rejectLetterRequest,
  markRequestUsed,
} = require("../controllers/letter-head/letterRequestController");
const {
  createLetters,
  getAllLetters,
  getLetterByRef,
  getLetterById,
  updateLetter,
  deleteCreatedLetter,
} = require("../controllers/letter-head/createdLetterController");
const authenticationMiddleware = require("../middlewares/authentication");

const router = express.Router();

// Multer setup 
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- REQUESTS ---
router.post("/requests", createLetterRequest);
router.get("/get-requests", authenticationMiddleware, getLetterRequests);
router.get("/requestes/:id", getLetterRequestById);
router.delete("/requestes/:id", deleteLetterRequest);
router.patch("/requests/:id/approve", authenticationMiddleware, approveLetterRequest);
router.patch("/requests/:id/reject", authenticationMiddleware, rejectLetterRequest);
router.patch("/requests/:id/mark-used", markRequestUsed);

// --- CREATED LETTERS (HISTORY) ---
router.post("/created-letters", createLetters);
router.get("/created-letters", authenticationMiddleware, getAllLetters);
router.get("/created-letters/ref/:refNo", authenticationMiddleware, getLetterByRef);
router.get("/created-letters/:id", authenticationMiddleware, getLetterById);
router.patch("/created-letters/:id", authenticationMiddleware, updateLetter);
router.delete("/created-letters/:id", authenticationMiddleware, deleteCreatedLetter);

// --- TEMPLATES (BASE) ---
router.post("/", upload.single("file"), authenticationMiddleware, createLetter);
router.get("/", authenticationMiddleware, getLetters);
router.delete("/:id", deleteLetter);
router.get("/:id/file", getLetterFile);
router.get("/:id", authenticationMiddleware, getLetterMetadata);

module.exports = router;

