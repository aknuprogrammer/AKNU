const express = require('express');
const router = express.Router();
const {
  getAllPurposes,
  getPurposeById,
  createPurpose,
  updatePurpose,
  deletePurpose
} = require('../../controllers/certificationFee/applicationPurposeController.js');

router.get('/', getAllPurposes);
router.get('/:id', getPurposeById);
router.post('/', createPurpose);
router.put('/:id', updatePurpose);
router.delete('/:id', deletePurpose);

module.exports = router;