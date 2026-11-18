const express = require("express");
const { createProfile, getProfile, getAllProfiles } = require("../../controllers/faculty_track/profileController");

const facultyProfileRouter = express.Router();

facultyProfileRouter.post("/", createProfile);
facultyProfileRouter.get("/:id", getProfile);
facultyProfileRouter.get("/", getAllProfiles);

module.exports = facultyProfileRouter;
