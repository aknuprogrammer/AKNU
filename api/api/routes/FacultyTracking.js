const express = require("express");
const {
  CreateAccount,
  Login,
  getProfile,
  createJourney,
  getJourneys,
  addStopPoint,
  resumeJourney,
  endJourney,
  editProfile,
  getJourney,
  getTrackingData,
} = require("../controllers/FacultyTracking/FacultyTrackingController");
const facultyAuthenticationMiddleware = require("../middlewares/FacultyMiddleWare");
const upload = require("../middlewares/multerConfig");

const router = express.Router();

router.post("/register", CreateAccount);
router.post("/login", Login);
router.get("/profile", facultyAuthenticationMiddleware, getProfile);
router.put("/profile", facultyAuthenticationMiddleware, editProfile);
router.post("/create-journey", facultyAuthenticationMiddleware, createJourney);
router.get("/get-journeys", facultyAuthenticationMiddleware, getJourneys);
router.get("/get-journey/:id", facultyAuthenticationMiddleware, getJourney);

// Add stop point - this automatically pauses the journey
router.post(
  "/add-stop/:id",
  facultyAuthenticationMiddleware,
  upload.array("images"),
  addStopPoint
);

// Resume journey after completing work at stop point
router.post(
  "/resume-journey/:id",
  facultyAuthenticationMiddleware,
  resumeJourney
);

// End journey
router.post(
  "/end-journey/:id",
  upload.array("bills"),
  facultyAuthenticationMiddleware,
  endJourney
);

// get router
router.get("/tracking-data", getTrackingData);
module.exports = router;
