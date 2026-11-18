const express = require("express");
const facultyLoginRouter = require("./loginRoutes");
const facultyProfileRouter = require("./profileRoutes");
const locationRouter = require("./locationRoutes");

const router = express.Router();

router.use("/logins", facultyLoginRouter);
router.use("/profiles", facultyProfileRouter);

router.use('/location', locationRouter);

console.log("____sdfsd")
module.exports = router;
