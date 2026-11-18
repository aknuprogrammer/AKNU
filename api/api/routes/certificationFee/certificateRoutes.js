const express = require('express');
const router = express.Router();
const certificateController = require('../../controllers/certificationFee/certificateController');

// Submit new certificate application
router.post('/', certificateController.submitApplication);
// Get application status by reference number
router.get('/:reference_no', certificateController.getApplicationStatus);

router.get('/', certificateController.getAllApplications);
module.exports = router;