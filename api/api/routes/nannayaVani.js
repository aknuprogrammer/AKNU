const express = require('express');
const router = express.Router();
const nannayaVaniController = require('../controllers/nannayaVani');
const multer = require('multer');
const authenticationMiddleware = require('../middlewares/authentication');

// Configure multer for memory storage with PDF validation
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory as buffers
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only allow single file upload
  }
});

// Error handling wrapper for async routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Public Routes
router.get('/', asyncHandler(nannayaVaniController.getEditions));
router.get('/:id/download', asyncHandler(nannayaVaniController.downloadEdition));
router.get('/:id/preview', asyncHandler(nannayaVaniController.previewEdition));

// Protected Routes (require authentication)
router.post(
  '/',
  authenticationMiddleware,
  upload.single('pdf'), // Handle single PDF upload
  asyncHandler(nannayaVaniController.createEdition)
);

router.put(
  '/:id',
  authenticationMiddleware,
  upload.single('pdf'), // Optional PDF update
  asyncHandler(nannayaVaniController.updateEdition)
);

router.delete(
  '/:id',
  authenticationMiddleware,
  asyncHandler(nannayaVaniController.deleteEdition)
);

// Error handling middleware for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Handle multer-specific errors
    return res.status(400).json({
      message: err.code === 'LIMIT_FILE_SIZE' 
        ? 'File size too large (max 10MB)' 
        : 'File upload error'
    });
  } else if (err) {
    // Handle other errors
    console.error('Route error:', err);
    return res.status(400).json({ 
      message: err.message || 'Bad request' 
    });
  }
  next();
});

module.exports = router;