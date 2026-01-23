const express = require('express');
const router = express.Router();
const { submitReport, getDensity } = require('../controllers/crowdController');
const { secure } = require('../middleware/middleware');

router.use(secure);

// @route   POST /api/crowd/report
// @desc    Report crowd density
router.post('/report', submitReport);

// @route   GET /api/crowd
// @desc    Get density for location
router.get('/', getDensity);

module.exports = router;
