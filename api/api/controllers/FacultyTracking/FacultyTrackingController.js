const Faculty = require("../../models/FacultyTracking/FacultyModal");
const JourneyModel = require("../../models/FacultyTracking/JourneyModal");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

// 🔹 REGISTER (Create Account)
const CreateAccount = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      pin,
      facultyId,
      department,
      university,
      college,
    } = req.body;

    if (
      !name ||
      !email ||
      !mobile ||
      !pin ||
      !facultyId ||
      !department ||
      !university
    ) {
      return res.status(400).send({ message: "Please fill all fields" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }, { facultyId }],
    });

    if (existingUser) {
      return res
        .status(400)
        .send({ message: "User already exists With this details" });
    }

    // Hash 4-digit pin
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pin, salt);

    const body = {
      email,
      pin: hash,
      facultyId,
      department,
      password: hash,
      fullName: name,
      phone: mobile,
      university,
    };

    if (college) body.college = college;

    const newUser = await User.create(body);

    return res.status(200).send({ message: "Account created successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};
const Login = async (req, res) => {
  try {
    const { mobile, pin } = req.body;

    // // console.log(req.body);

    if (!mobile || !pin) {
      return res.status(400).json({ message: "Please provide mobile and pin" });
    }

    // const all = await User.find({});

    // console.log(all);

    // Find user by email OR mobile
    const user = await User.findOne({
      phone: mobile,
    });

    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(pin, user.pin);

    console.log(isMatch, pin, user.pin);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid PIN" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, facultyId: user.facultyId },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        facultyId: user.facultyId,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProfile = async (req, res) => {
  // console.log("API HIT");

  try {
    const user = req.user;
    // console.log(user);
    // const user = await User

    const getUser = await User.findById(user._id).populate("university");

    console.log(getUser);
    return res.status(200).send(getUser);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const createJourney = async (req, res) => {
  // console.log("CREATE JOURNEYS");
  const facultyId = req.user._id;
  try {
    const { purpose, description, fromLocation, toLocation, startCoordinates } =
      req.body;

    const existingPendingJourney = await JourneyModel.findOne({
      facultyId,
      status: { $in: ["pending", "in-progress"] },
    });

    if (existingPendingJourney) {
      return res
        .status(400)
        .send({ message: "Please complete the existing journey" });
    }

    const journey = await JourneyModel.create({
      facultyId,
      purpose,
      description,
      fromLocation,
      toLocation,
      startCoordinates,
      currentLocation: startCoordinates,
      status: "in-progress",
    });

    res.status(200).json({ success: true, journey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const editProfile = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    const userId = req.user.id;

    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { fullName: name, phone: mobile },
      { new: true }
    ).select("-password");

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// POST /api/journey/:id/stop
const addStopPoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, lat, lng } = req.body;

    const coordinates = { lat: Number(lat), lng: Number(lng) };

    // console.log(name, description, location, coordinates);

    const journey = await JourneyModel.findById(id);
    if (!journey) return res.status(404).json({ message: "Journey not found" });

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push({
          data: file.buffer,
          contentType: file.mimetype,
          filename: file.originalname,
        });
      });
    }

    // Create stop point object
    const stopPoint = {
      name,
      description,
      location,
      coordinates,
      images,
    };

    journey.stopPoints.push(stopPoint);
    journey.currentLocation = coordinates;
    journey.status = "paused"; // optional: mark paused at stop

    await journey.save();

    // console.log("ADD STOP HIT");

    res.json({ success: true, journey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// This is the correct logic for your FacultyTrackingController.js
// The addStopPoint function should already pause the journey
// The resumeJourney function should resume it

// Your existing addStopPoint function already sets status to "paused"
// So you don't need a separate pauseJourney endpoint

// Just make sure your resumeJourney function is correct:
const resumeJourney = async (req, res) => {
  try {
    const { id } = req.params;
    const { coordinates } = req.body;
    const facultyId = req.user._id;

    // Validate required fields
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return res
        .status(400)
        .json({ message: "Current coordinates (lat, lng) are required" });
    }

    // Find paused journey for current user
    const journey = await JourneyModel.findOne({
      facultyId,
      _id: id,
      status: "paused",
    });

    if (!journey) {
      return res
        .status(404)
        .json({ message: "No paused journey found to resume" });
    }

    // Resume journey
    journey.status = "in-progress";
    journey.currentLocation = coordinates;
    journey.updatedAt = new Date();

    await journey.save();

    res.status(200).json({
      success: true,
      message: "Journey resumed successfully",
      journey,
    });
  } catch (error) {
    console.error("Error resuming journey:", error);
    res.status(500).json({
      success: false,
      message: "Server error while resuming journey",
      error: error.message,
    });
  }
};

const getJourneys = async (req, res) => {
  const facultyId = req.user._id;
  const { page = 1, limit = 5 } = req.query;

  // console.log("GET JOURNEYS");

  try {
    const skip = (page - 1) * limit;
    const data = await JourneyModel.find({ facultyId })
      .select("-stopPoints.images.data")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // console.log(data);

    return res.status(200).send(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const endJourney = async (req, res) => {
  // console.log("END JOURNEY");
  console.log(req.body, "ljLKLJswj");
  try {
    const { id } = req.params;
    const {
      endCoordinates,
      endingNotes,

      travelExpense,
      foodExpense,
      accommodationExpense,
      fuelExpense,
    } = req.body;
    const facultyId = req.user._id;

    // console.log(travelExpense, foodExpense, accommodationExpense, fuelExpense);

    const Coordinates = JSON.parse(endCoordinates);
    console.log(endCoordinates, "JOURNRY");

    // Validate required fields
    if (!Coordinates || !Coordinates.lat || !Coordinates.lng) {
      console.log("INSIDE IF");
      return res
        .status(400)
        .json({ message: "End coordinates (lat, lng) are required" });
    }
    console.log("out IF");
    // Find journey for current user
    const journey = await JourneyModel.findById(id);

    console.log(journey, "JOURNRY");

    if (!journey) {
      return res
        .status(404)
        .json({ message: "No active or paused journey found" });
    }

    // Update journey
    journey.status = "completed";
    journey.endCoordinates = Coordinates;
    journey.currentLocation = Coordinates;
    journey.endingNotes = endingNotes;
    journey.updatedAt = new Date();

    if (travelExpense) journey.travelExpense = travelExpense;
    if (foodExpense) journey.foodExpense = foodExpense;
    if (accommodationExpense)
      journey.accommodationExpense = accommodationExpense;
    if (fuelExpense) journey.fuelExpense = fuelExpense;

    if (req.files && req.files.length > 0) {
      journey.bills = req.files.map((file) => ({
        data: file.buffer,
        contentType: file.mimetype,
        filename: file.originalname,
      }));

      console.log(`Saved ${req.files.length} bill images`);
    }

    await journey.save();

    res.status(200).json({
      success: true,
      message: "Journey ended successfully",
    });
  } catch (error) {
    console.error("Error ending journey:", error);
    res.status(500).json({
      success: false,
      message: "Server error while ending journey",
      error: error.message,
    });
  }
};

// Add this function to your FacultyTrackingController.js

const pauseJourney = async (req, res) => {
  // console.log("PAUSE JOURNEY");
  try {
    const { id } = req.params;
    const { coordinates } = req.body;
    const facultyId = req.user._id;

    // Validate required fields
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return res
        .status(400)
        .json({ message: "Current coordinates (lat, lng) are required" });
    }

    // Find journey for current user
    const journey = await JourneyModel.findOne({
      facultyId,
      _id: id,
      status: "in-progress",
    });

    if (!journey) {
      return res
        .status(404)
        .json({ message: "No active journey found to pause" });
    }

    // Update journey
    journey.status = "paused";
    journey.currentLocation = coordinates;
    journey.updatedAt = new Date();

    await journey.save();

    res.status(200).json({
      success: true,
      message: "Journey paused successfully",
      journey,
    });
  } catch (error) {
    console.error("Error pausing journey:", error);
    res.status(500).json({
      success: false,
      message: "Server error while pausing journey",
      error: error.message,
    });
  }
};

const getTrackingData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await JourneyModel.countDocuments();

    const journeys = await JourneyModel.find()
      .populate("facultyId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      totalRecords: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: journeys,
    });
  } catch (error) {
    console.error("Error fetching journeys:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching journey data",
      error: error.message,
    });
  }
};

const getJourney = async (req, res) => {
  try {
    const data = await JourneyModel.findById(req.params.id).populate(
      "facultyId"
    );

    return res.status(200).send(data);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching journey data",
      error: e.message,
    });
  }
};

// Don't forget to export this function
module.exports = {
  CreateAccount,
  Login,
  getProfile,
  createJourney,
  getJourneys,
  addStopPoint,
  resumeJourney,
  endJourney,
  pauseJourney, // Add this
  editProfile,
  getTrackingData,
  getJourney,
};
