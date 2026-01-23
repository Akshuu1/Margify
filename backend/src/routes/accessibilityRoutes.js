const express = require('express');
const router = express.Router();
const { reportIssue, getIssues } = require('../controllers/accessibilityController');
const { secure } = require('../middleware/middleware');

router.use(secure);

// @route   POST /api/accessibility/report
// @desc    Report an accessibility issue
router.post('/report', reportIssue);

// @route   GET /api/accessibility/issues/:stationId
// @desc    Get active issues for a station
router.get('/issues/:stationId', getIssues);

module.exports = router;
