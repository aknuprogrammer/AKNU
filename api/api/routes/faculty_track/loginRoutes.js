const express = require("express");
const { loginFaculty, logoutFaculty } = require("../../controllers/faculty_track/loginController");

const facultyLoginRouter = express.Router();

facultyLoginRouter.post("/", loginFaculty);
facultyLoginRouter.post("/logout", logoutFaculty);

module.exports = facultyLoginRouter;
