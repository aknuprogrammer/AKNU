import FacultyProfile from "../../models/faculty_track/profiles.js";
import bcrypt from "bcryptjs";

// Create profile
export const createProfile = async (req, res) => {
  try {
    console.log("_______faculty track data", req.body);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const profileData = {
      ...req.body,
      password: hashedPassword,
    };

    const profile = new FacultyProfile(profileData);
    await profile.save();

    res.json({ message: "Profile created", profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get profile by ID
export const getProfile = async (req, res) => {
  try {
    const profile = await FacultyProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Optional: Get all profiles
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await FacultyProfile.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
