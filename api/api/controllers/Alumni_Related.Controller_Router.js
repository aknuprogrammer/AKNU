const express = require("express");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");

const AlumniRegistrationForm = require("../models/examination/aknuform/alumniRegistrationForm");
const {
  AlumniDonationModel,
  AlumniEventAddModel,
  ExistingAlumniModel,
} = require("../models/examination/aknuform/Alumni_Related_Models");
const { verifyPassword } = require("../utils/password_validate");

const alumni_new_sub_router = express.Router();

// Configure multer for event photos storage (using memory storage)
const eventPhotosJsonPath = "api/uploads/alumni/event-photos.json";

// Ensure directory exists for JSON file
const eventPhotosJsonDir = path.resolve(process.cwd(), "api/uploads/alumni");
const eventPhotosJsonPathAbsolute = path.resolve(
  process.cwd(),
  eventPhotosJsonPath
);

if (!fsSync.existsSync(eventPhotosJsonDir)) {
  fsSync.mkdirSync(eventPhotosJsonDir, { recursive: true });
}

// Initialize JSON file if it doesn't exist
if (!fsSync.existsSync(eventPhotosJsonPathAbsolute)) {
  fsSync.writeFileSync(
    eventPhotosJsonPathAbsolute,
    JSON.stringify([], null, 2),
    "utf8"
  );
}

// Use memory storage to store files as buffers
const uploadEventPhotos = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 50, // Maximum 50 files allowed
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(
        new Error("Only image files are allowed! (jpeg, jpg, png, gif, webp)"),
        false
      );
    }
  },
});

// Helper function to get absolute path for JSON file
const getEventPhotosJsonPath = () => eventPhotosJsonPathAbsolute;

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: "Token missing" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded; // { id, username }
    next();
  });
}

// 📌 GET /alumni/me → get logged-in alumni details
alumni_new_sub_router.get("/me", authenticateToken, async (req, res) => {
  try {
    let user = await AlumniRegistrationForm.findById(req.user.id).select(
      "-password"
    ); // exclude password
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * 1. LOGIN
 */
alumni_new_sub_router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
    const query = isEmail ? { email: username } : { username };
    const user = await AlumniRegistrationForm.findOne(query);
    if (!user) return res.status(401).json({ error: "Invalid username" });

    // ⚠️ For production: hash passwords, don’t store plain text
    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "365d" }
    );
    res.cookie("alumni_token", token, {
      httpOnly: true, // ❌ JS cannot read (prevents XSS)
      secure: true, // ✅ only over HTTPS (use in prod)
      sameSite: "strict",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 365 days
    });

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * 2. DONATE - create Razorpay order and save donation record
 */
alumni_new_sub_router.post("/donate", async (req, res) => {
  try {
    const {
      donorName,
      donorEmail,
      donorPhone,
      amount,
      currency,
      purpose,
      paymentMethod,
      message,
    } = req.body;

    // 1. Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay works in paise
      currency: currency || "INR",
      payment_capture: 1,
    });

    // 2. Save donation record (transactionId = Razorpay orderId for now)
    const donation = new AlumniDonationModel({
      donorName,
      donorEmail,
      donorPhone,
      amount,
      currency: currency || "INR",
      purpose,
      paymentMethod,
      transactionId: order.id,
      message,
    });
    await donation.save();

    // 3. Send order info + public key to client
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      donation,
    });
  } catch (err) {
    console.error("Donation error:", err);
    res.status(500).json({ error: "Donation failed" });
  }
});

/**
 * 3. ADD EVENT
 */
alumni_new_sub_router.post("/add-event", async (req, res) => {
  try {
    const event = new AlumniEventAddModel(req.body);
    await event.save();
    res.json({ message: "Event added", event });
  } catch (err) {
    console.error("Add event error:", err);
    res.status(500).json({ error: "Failed to add event" });
  }
});

/**
 * 4. GET ALL DONATIONS
 */
alumni_new_sub_router.get("/get-all-donations", async (req, res) => {
  try {
    const donations = await AlumniDonationModel.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch donations" });
  }
});

/**
 * 5. GET ALL ALUMNI
 */
alumni_new_sub_router.get("/get-all-alumni", async (req, res) => {
  try {
    const alumni = await AlumniRegistrationForm.find().sort({ createdAt: -1 });
    res.json(alumni);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch alumni" });
  }
});

/**
 * 6. ALUMNI REGISTRATION CHECK
 */
alumni_new_sub_router.get("/alumni-reg-check/:reg_no", async (req, res) => {
  try {
    const { reg_no } = req.params;
    const exists = await ExistingAlumniModel.exists({ reg_no });
    res.json({ exists: !!exists });
  } catch (err) {
    res.status(500).json({ error: "Failed to check reg_no" });
  }
});

/**
 * 7. GET ALL EVENTS
 */
alumni_new_sub_router.get("/get-all-events", async (req, res) => {
  try {
    const events = await AlumniEventAddModel.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

alumni_new_sub_router.get("/get-approved-events", async (req, res) => {
  try {
    const events = await AlumniEventAddModel.find({
      adminApprovedStatus: "APPROVED",
    }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch approved events" });
  }
});

// Approve Event
alumni_new_sub_router.patch("/events/:id/approve", async (req, res) => {
  try {
    const updatedEvent = await AlumniEventAddModel.findByIdAndUpdate(
      req.params.id,
      { adminApprovedStatus: "APPROVED" },
      { new: true }
    );
    if (!updatedEvent)
      return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event approved successfully", event: updatedEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reject Event
alumni_new_sub_router.patch("/events/:id/reject", async (req, res) => {
  try {
    const updatedEvent = await AlumniEventAddModel.findByIdAndUpdate(
      req.params.id,
      { adminApprovedStatus: "REJECTED" },
      { new: true }
    );
    if (!updatedEvent)
      return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event rejected successfully", event: updatedEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 8. UPLOAD EVENT PHOTOS
 * POST /alumni/event-photos
 * Stores photos on disk and metadata in JSON file
 */
alumni_new_sub_router.post(
  "/event-photos",
  (req, res, next) => {
    // Multer middleware with inline error handling
    // Use .any() to accept files with any field name (e.g., "photos", "up", "images", etc.)
    uploadEventPhotos.any()(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
              success: false,
              error: `Unexpected file field: ${err.field}. All file fields are accepted, but there may be a configuration issue.`,
              code: err.code,
              field: err.field,
            });
          }
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              success: false,
              error: "File too large. Maximum size is 10MB per file.",
            });
          }
          if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
              success: false,
              error: "Too many files. Maximum 50 photos allowed.",
            });
          }
          return res.status(400).json({
            success: false,
            error: `Upload error: ${err.message}`,
            code: err.code,
          });
        }
        // FileFilter or other errors
        return res.status(400).json({
          success: false,
          error: err.message || "File upload error",
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const { eventName, eventType } = req.body;

      console.log("=== Event Photos Upload Request ===");
      console.log("Request body:", req.body);
      console.log("eventName:", eventName);
      console.log("eventType:", eventType);
      console.log("Files received:", req.files ? req.files.length : 0);
      if (req.files && req.files.length > 0) {
        console.log(
          "File details:",
          req.files.map((f) => ({
            originalname: f.originalname,
            mimetype: f.mimetype,
            size: f.size,
          }))
        );
      }

      // Validate required fields
      if (!eventName || !eventType) {
        console.log("Validation failed: Missing eventName or eventType");
        return res.status(400).json({
          success: false,
          error: "eventName and eventType are required",
          received: { eventName: !!eventName, eventType: !!eventType },
        });
      }

      // Validate files
      if (!req.files || req.files.length === 0) {
        console.log("Validation failed: No files received");
        return res.status(400).json({
          success: false,
          error: "At least one photo is required",
          filesReceived: req.files ? req.files.length : 0,
        });
      }

      // Read existing JSON file
      let eventsData = [];
      try {
        const jsonContent = await fs.readFile(getEventPhotosJsonPath(), "utf8");
        eventsData = JSON.parse(jsonContent);
      } catch (err) {
        console.error("Error reading JSON file, starting fresh:", err);
        eventsData = [];
      }

      // Convert buffer to base64 and prepare photo data for JSON storage
      const photoPaths = req.files.map((file, index) => {
        // Convert buffer to base64 string for JSON storage
        const base64String = file.buffer.toString("base64");
        return {
          id:
            Date.now().toString() +
            index +
            Math.random().toString(36).substr(2, 9),
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          data: base64String, // Store image as base64 in JSON
        };
      });

      // Create new event photo entry
      const newEventPhoto = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        eventName: eventName.trim(),
        eventType: eventType.trim(),
        photos: photoPaths,
        uploadedAt: new Date().toISOString(),
      };

      // Add to events data
      eventsData.push(newEventPhoto);

      // Write back to JSON file
      await fs.writeFile(
        getEventPhotosJsonPath(),
        JSON.stringify(eventsData, null, 2),
        "utf8"
      );

      res.status(201).json({
        success: true,
        message: "Event photos uploaded successfully",
        data: newEventPhoto,
      });
    } catch (error) {
      console.error("Error uploading event photos:", error);
      console.error("Error stack:", error.stack);

      // No need to clean up files since they're in memory (will be garbage collected)

      res.status(500).json({
        success: false,
        error: "Failed to upload event photos",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }
);

/**
 * 9. GET ALL EVENT PHOTOS
 * GET /alumni/event-photos
 * Retrieves all event photos from JSON file
 */
alumni_new_sub_router.get("/event-photos", async (req, res) => {
  try {
    const { eventType, eventName } = req.query;

    // Read JSON file
    let eventsData = [];
    try {
      const jsonContent = await fs.readFile(getEventPhotosJsonPath(), "utf8");
      eventsData = JSON.parse(jsonContent);
    } catch (err) {
      if (err.code === "ENOENT") {
        // File doesn't exist yet, return empty array
        return res.json({ success: true, data: [] });
      }
      throw err;
    }

    // Filter by eventType if provided
    if (eventType) {
      eventsData = eventsData.filter(
        (event) => event.eventType.toLowerCase() === eventType.toLowerCase()
      );
    }

    // Filter by eventName if provided
    if (eventName) {
      eventsData = eventsData.filter((event) =>
        event.eventName.toLowerCase().includes(eventName.toLowerCase())
      );
    }

    // Sort by uploadedAt (newest first)
    eventsData.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    // Optionally exclude photo data for list view (to reduce response size)
    const includePhotoData = req.query.includePhotoData === "true";
    const responseData = includePhotoData
      ? eventsData.map((event) => ({
          ...event,
          photos: event.photos.map((photo) => ({
            ...photo,
            // Include both data URL and API URL
            dataUrl: photo.data
              ? `data:${photo.mimetype};base64,${photo.data}`
              : null,
            url: `/api/alumni/event-photos/${event.id}/photo/${photo.id}`,
          })),
        }))
      : eventsData.map((event) => ({
          ...event,
          photos: event.photos.map((photo) => ({
            id: photo.id,
            originalName: photo.originalName,
            mimetype: photo.mimetype,
            size: photo.size,
            // Provide both URL options
            url: `/api/alumni/event-photos/${event.id}/photo/${photo.id}`,
            dataUrl: photo.data
              ? `data:${photo.mimetype};base64,${photo.data}`
              : null,
          })),
        }));

    res.json({
      success: true,
      data: responseData,
      count: responseData.length,
    });
  } catch (error) {
    console.error("Error fetching event photos:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch event photos",
      details: error.message,
    });
  }
});

/**
 * 10. GET SINGLE EVENT PHOTOS BY ID
 * GET /alumni/event-photos/:id
 * Retrieves a specific event photo entry by ID
 */
alumni_new_sub_router.get("/event-photos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Read JSON file
    let eventsData = [];
    try {
      const jsonContent = await fs.readFile(getEventPhotosJsonPath(), "utf8");
      eventsData = JSON.parse(jsonContent);
    } catch (err) {
      if (err.code === "ENOENT") {
        return res.status(404).json({
          success: false,
          error: "Event photos not found",
        });
      }
      throw err;
    }

    // Find event by ID
    const event = eventsData.find((e) => e.id === id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event photos not found",
      });
    }

    // Add data URLs and API URLs to photos
    const eventWithUrls = {
      ...event,
      photos: event.photos.map((photo) => ({
        ...photo,
        dataUrl: photo.data
          ? `data:${photo.mimetype};base64,${photo.data}`
          : null,
        url: `/api/alumni/event-photos/${event.id}/photo/${photo.id}`,
      })),
    };

    res.json({
      success: true,
      data: eventWithUrls,
    });
  } catch (error) {
    console.error("Error fetching event photos:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch event photos",
      details: error.message,
    });
  }
});

/**
 * 11. GET SINGLE PHOTO BY EVENT ID AND PHOTO ID
 * GET /alumni/event-photos/:eventId/photo/:photoId
 * Retrieves and serves a specific photo as an image
 */
alumni_new_sub_router.get(
  "/event-photos/:eventId/photo/:photoId",
  async (req, res) => {
    try {
      const { eventId, photoId } = req.params;

      // Read JSON file
      let eventsData = [];
      try {
        const jsonContent = await fs.readFile(getEventPhotosJsonPath(), "utf8");
        eventsData = JSON.parse(jsonContent);
      } catch (err) {
        if (err.code === "ENOENT") {
          return res.status(404).json({
            success: false,
            error: "Event photos not found",
          });
        }
        throw err;
      }

      // Find event by ID
      const event = eventsData.find((e) => e.id === eventId);

      if (!event) {
        return res.status(404).json({
          success: false,
          error: "Event not found",
        });
      }

      // Find photo by ID
      const photo = event.photos.find((p) => p.id === photoId);

      if (!photo || !photo.data) {
        return res.status(404).json({
          success: false,
          error: "Photo not found",
        });
      }

      // Convert base64 to buffer and serve as image
      const imageBuffer = Buffer.from(photo.data, "base64");

      res.set("Content-Type", photo.mimetype || "image/jpeg");
      res.set(
        "Content-Disposition",
        `inline; filename="${photo.originalName}"`
      );
      res.set("Content-Length", imageBuffer.length);

      res.send(imageBuffer);
    } catch (error) {
      console.error("Error serving photo:", error);
      res.status(500).json({
        success: false,
        error: "Failed to serve photo",
        details: error.message,
      });
    }
  }
);

/**
 * 12. DELETE EVENT PHOTOS BY ID
 * DELETE /alumni/event-photos/:id
 * Deletes an event photo entry from JSON file
 */
alumni_new_sub_router.delete("/event-photos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("=== DELETE Event Photos Route Hit ===");
    console.log("Event ID received:", id);
    console.log("Request method:", req.method);
    console.log("Request path:", req.path);

    // Read JSON file
    let eventsData = [];
    try {
      const jsonContent = await fs.readFile(getEventPhotosJsonPath(), "utf8");
      eventsData = JSON.parse(jsonContent);
      console.log("Total events in JSON:", eventsData.length);
      console.log(
        "Available event IDs:",
        eventsData.map((e) => e.id)
      );
    } catch (err) {
      console.error("Error reading JSON file:", err);
      if (err.code === "ENOENT") {
        return res.status(404).json({
          success: false,
          error: "Event photos JSON file not found",
        });
      }
      throw err;
    }

    // Find event index by ID
    const eventIndex = eventsData.findIndex((e) => e.id === id);
    console.log("Event index found:", eventIndex);

    if (eventIndex === -1) {
      console.log("Event not found with ID:", id);
      return res.status(404).json({
        success: false,
        error: "Event photos not found",
        requestedId: id,
        availableIds: eventsData.map((e) => e.id),
      });
    }

    // Remove the event from array
    const deletedEvent = eventsData.splice(eventIndex, 1)[0];

    // Write back to JSON file
    await fs.writeFile(
      getEventPhotosJsonPath(),
      JSON.stringify(eventsData, null, 2),
      "utf8"
    );

    console.log("Event deleted successfully:", id);

    res.json({
      success: true,
      message: "Event photos deleted successfully",
      data: {
        id: deletedEvent.id,
        eventName: deletedEvent.eventName,
        eventType: deletedEvent.eventType,
        photosCount: deletedEvent.photos ? deletedEvent.photos.length : 0,
      },
    });
  } catch (error) {
    console.error("Error deleting event photos:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      error: "Failed to delete event photos",
      details: error.message,
    });
  }
});

module.exports = alumni_new_sub_router;
