const express = require("express");
const router = express.Router();
const { addStudentEmails } = require("../../controllers/admission/addStudentEmailsController");

// POST /api/students/add-student-emails - Add dummy emails to students without emails
router.post("/add-student-emails", addStudentEmails);

module.exports = router;
