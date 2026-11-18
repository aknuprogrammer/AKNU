const express = require('express');
const router = express.Router();
const departmentSeminarController = require('../../controllers/website/departmentSeminarController');

router.post('/', departmentSeminarController.createSeminar);
router.get('/', departmentSeminarController.getSeminars);
router.put('/:id', departmentSeminarController.updateSeminar);
router.delete('/:id', departmentSeminarController.deleteSeminar);

module.exports = router;
