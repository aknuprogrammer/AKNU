// routes/modules.js
const express = require('express');
const router = express.Router();

const { getAllModules,   
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  searchModules,
  getModulesByAccessType,
  getModuleStats } = require('../../controllers/pinkmoon_master_panel/moduleController');

// GET /api/modules
router.get('/', getAllModules);

// GET /api/modules/stats/summary
router.get('/stats/summary', getModuleStats);

// GET /api/modules/access/:accessType
router.get('/access/:accessType', getModulesByAccessType);

// GET /api/modules/search/:name
router.get('/search/:name', searchModules);

// GET /api/modules/:id
router.get('/:id', getModuleById);

// POST /api/modules
router.post('/', createModule);

// PUT /api/modules/:id
router.put('/:id', updateModule);

// DELETE /api/modules/:id
router.delete('/:id', deleteModule);

module.exports = router;