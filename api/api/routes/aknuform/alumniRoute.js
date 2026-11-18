const express = require('express');
const alumniRoute = express.Router();
const AlumniRegistrationForm = require('../../models/examination/aknuform/alumniRegistrationForm');
const authenticationMiddleware = require('../../middlewares/authentication');

const multer = require('multer');
const { hashPassword } = require('../../utils/password_validate');
const Volunteer = require('../../models/examination/aknuform/Volunteer');
const upload = multer(); // no storage, we just want memory buffer

alumniRoute.post(
  '/alumni-registration',
  upload.single('photo'),
  async (req, res) => {
    try {
      console.log("Body:", req.body);
      console.log("File:", req.file);

      const alumniData = new AlumniRegistrationForm({
        ...req.body,
        password: await hashPassword(req.body.password),
        photo: req.file?.buffer,
        photoContentType: req.file?.mimetype,
      });

      await alumniData.save();
      res.status(201).json({ message: 'Alumni registered successfully!', data: alumniData });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error registering alumni', error });
    }
  }
);


// GET Route: Get all Alumni
alumniRoute.get('/alumni-registration', authenticationMiddleware,async (req, res) => {
  console.log("_____dfssdfsa")
  try {
    const alumniList = await AlumniRegistrationForm.find();
    res.status(200).json(alumniList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alumni data', error });
  }
});


// ================= VOLUNTEER REGISTRATION =================
alumniRoute.post('/volunteers/register', async (req, res) => {
  try {
    const { name, email, phone, interest, message } = req.body;
console.log("____req.body",req.body)
    if (!name || !email || !phone || !interest) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    // Check for duplicate email
    const existingVolunteer = await Volunteer.findOne({ email });
    if (existingVolunteer) {
      return res.status(400).json({ error: "This email is already registered." });
    }

    const volunteer = new Volunteer({ name, email, phone, interest, message });
    await volunteer.save();

    res.status(201).json({ message: "Volunteer registered successfully", data: volunteer });
  } catch (error) {
    console.error("Volunteer registration error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET Route: Get all Volunteers (optional, for admin)
alumniRoute.get('/volunteers', authenticationMiddleware, async (req, res) => {
  try {
    const volunteers = await Volunteer.find();
    res.status(200).json(volunteers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching volunteers" });
  }
});



module.exports = alumniRoute;
