const express = require('express');
const collegeController = require('../../controllers/certificationFee/collegeController');
const router = express.Router();

router.route('/')
  .post(collegeController.createCollege)
  .get(collegeController.getAllColleges);

router.route('/:id')
  .get(collegeController.getCollegeById)
  .put(collegeController.updateCollege)
  .delete(collegeController.deleteCollege);

module.exports = router;