const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");

router.post("/", async (req, res) => {
  const {
    role,
    password,
    username,
    pin,
    employeeId,
    department,
    jobTitle,
    email: onboardingEmail,
  } = req.body;
  // console.log("____________req", req.body);

  // Check if this is an onboarding registration request
  if (username && pin && employeeId && onboardingEmail) {
    // This is an onboarding registration request
    try {
      // Convert pin to number and validate (6 digits)
      const pinNumber = parseInt(pin, 10);
      if (isNaN(pinNumber) || pinNumber < 100000 || pinNumber > 999999) {
        return res.status(400).json({
          message: "PIN must be a 6-digit number (100000-999999)",
          error: "Invalid PIN format",
        });
      }

      // Hash password if provided
      let hashedPassword = null;
      if (password) {
        if (password.length < 6) {
          return res.status(400).json({
            message: "Password must be at least 6 characters",
            error: "Invalid password format",
          });
        }
        hashedPassword = await bcrypt.hash(password, 10);
      }

      // Check if user already exists by email or employeeId
      const existingUser = await User.findOne({
        $or: [{ email: onboardingEmail }, { employeeId }, { username }],
      });

      if (existingUser) {
        // Update existing user
        existingUser.username = username.toLowerCase().trim();
        existingUser.pin = pinNumber;
        if (hashedPassword) {
          existingUser.password = hashedPassword;
        }
        existingUser.employeeId = employeeId;
        existingUser.department = department;
        existingUser.jobTitle = jobTitle;
        existingUser.email = onboardingEmail;
        existingUser.updatedAt = new Date();

        await existingUser.save();

        return res.status(200).json({
          message: "User credentials updated successfully",
          user: {
            id: existingUser._id,
            email: existingUser.email,
            username: existingUser.username,
            employeeId: existingUser.employeeId,
            department: existingUser.department,
            jobTitle: existingUser.jobTitle,
          },
        });
      } else {
        // Create new user
        const newUser = new User({
          email: onboardingEmail,
          username: username.toLowerCase().trim(),
          pin: pinNumber,
          password: hashedPassword,
          employeeId,
          department,
          jobTitle,
          role: "employee", // Default role for employees
        });

        await newUser.save();

        return res.status(201).json({
          message: "User created successfully from onboarding",
          user: {
            id: newUser._id,
            email: newUser.email,
            username: newUser.username,
            employeeId: newUser.employeeId,
            department: newUser.department,
            jobTitle: newUser.jobTitle,
          },
        });
      }
    } catch (err) {
      console.log("____err", err);
      if (err.code === 11000) {
        // Duplicate key error
        return res.status(400).json({
          message:
            "User with this email, employeeId, or username already exists",
          error: err.message,
        });
      }
      return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }
  }

  // This is a regular login request
  const loginEmail = role; 
  const loginPassword = password;
  
  // console.log(`[DEBUG] Login attempt - Email: "${loginEmail}", Password Length (trimmed): ${loginPassword.length}`);
  
  if (!loginEmail || !loginPassword) {
    console.log("[DEBUG] Login failed: Missing email or password");
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const user = await User.findOne({ email: loginEmail });
    const alldata = await User.find({});
    console.log("____________user", alldata, user);

    if (!user) {
      // console.log(`[DEBUG] Login failed: No user found for "${loginEmail}"`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.password) {
        console.log(`[DEBUG] DB Hash Prefix: ${user.password.substring(0, 10)}... Length: ${user.password.length}`);
    } else {
        console.log(`[DEBUG] DB Password field is MISSING or EMPTY`);
    }

    const isMatch = await bcrypt.compare(loginPassword, user.password);
    console.log(`[DEBUG] Password match: ${isMatch}`);

    if (!isMatch) {
      console.log(`[DEBUG] Login failed: Password mismatch for "${loginEmail}"`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(`[DEBUG] Login successful for: "${loginEmail}"`);
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, user: user },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );
    // console.log("_________token", token);

    // ✅ include all new fields in response
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
        employeeId: user.employeeId,
        campus: user.campus,
        branch: user.branch,
        department: user.department,
        designation: user.designation,
        jobTitle: user.jobTitle,
        fullName: user.fullName,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.log("____err", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/profile", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send({ message: "UnAuthorized" });
  const data = jwt.verify(token, process.env.JWT_SECRET);
  // console.log(data);
  const id = data.id;
  const existingUser = await User.findById(id).select("-password");
  if (!existingUser) return res.status(404).send({ message: "User Not Found" });

  return res.status(200).send(existingUser);
});

module.exports = router;
