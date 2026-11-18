import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import FacultyLogin from "../../models/faculty_track/login.js";
import FacultyProfile from "../../models/faculty_track/profiles.js";

// Login API
const JWT_SECRET = process.env.JWT_SECRET || "faculty_track_secret_key_for_jwt"; // Use env variable in production

// Login API
export const loginFaculty = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find faculty profile
    const profile = await FacultyProfile.findOne({ email });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, profile.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Save login entry
    const loginEntry = new FacultyLogin({
      profile: profile._id,
      email: profile.email,
      password: profile.password, // hashed
      loggedInAt: new Date(),
    });

    await loginEntry.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: profile._id, email: profile.email }, 
      JWT_SECRET, 
      { expiresIn: "365d" }
    );

    res.json({
      message: "Login successful",
      profile,
      token,          // send token to client
      login: loginEntry,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// logout
export const logoutFaculty = async (req, res) => {
  try {
    const { loginId } = req.body;

    const loginEntry = await FacultyLogin.findById(loginId);
    if (!loginEntry)
      return res.status(404).json({ message: "Login session not found" });

    loginEntry.loggedOutAt = new Date();
    await loginEntry.save();

    res.json({ message: "Logout successful", login: loginEntry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
