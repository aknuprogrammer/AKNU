const express = require("express");
const router = express.Router();
const driverController = require("../../controllers/transportation/driverController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "api/uploads/drivers";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"));
    }
});

const upload = multer({ storage: storage });

// Create
router.post("/", upload.single("photo"), driverController.createDriver);

// Read All
router.get("/", driverController.getAllDrivers);

// Read One
router.get("/:id", driverController.getDriverById);

// Update
router.put("/:id", upload.single("photo"), driverController.updateDriver);

// Delete
router.delete("/:id", driverController.deleteDriver);

module.exports = router;
