const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createPaySlip,
  getPaySlips,
  getPaySlipById,
  getPaySlipsByEmployeeId,
  updatePaySlip,
  deletePaySlip,
  getPaySlipFile,
  approvePaySlip,
  rejectPaySlip,
} = require("../../controllers/employee/paySlipController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

// Multer setup for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow PDF, images, and common document types
    const allowedTypes = /pdf|jpeg|jpg|png|gif|doc|docx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, images, and document files are allowed!"), false);
    }
  },
});

// Routes
router.post(
  "/upload-pay-slip",
  authenticationMiddleware,
  upload.single("paySlipFile"),
  createPaySlip
);

router.get("/upload-pay-slip", authenticationMiddleware, getPaySlips);

router.get("/upload-pay-slip/:id", authenticationMiddleware, getPaySlipById);

router.get(
  "/upload-pay-slip/employee/:employeeId",
  authenticationMiddleware,
  getPaySlipsByEmployeeId
);

router.put(
  "/upload-pay-slip/:id",
  authenticationMiddleware,
  upload.single("paySlipFile"),
  updatePaySlip
);

router.delete(
  "/upload-pay-slip/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  deletePaySlip
);

// Route to download/view pay slip file
router.get(
  "/upload-pay-slip/:id/file",
  authenticationMiddleware,
  getPaySlipFile
);

// Route to approve pay slip (Admin only)
router.patch(
  "/upload-pay-slip/:id/approve",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  approvePaySlip
);

// Route to reject pay slip (Admin only)
router.patch(
  "/upload-pay-slip/:id/reject",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  rejectPaySlip
);

module.exports = router;
