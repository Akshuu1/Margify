const express = require('express');
const router = express.Router();
const { logCommute, getCommutePrediction, getCommuteInsights } = require('../controllers/commuteController');
const { secure } = require('../middleware/middleware');

router.use(secure);

// @route   POST /api/commute/log
// @desc    Log a commute trip
router.post('/log', logCommute);

// @route   GET /api/commute/predict
// @desc    Get AI prediction for next trip
router.get('/predict', getCommutePrediction);

// @route   GET /api/commute/insights
// @desc    Get user travel habits stats
router.get('/insights', getCommuteInsights);

module.exports = router;
