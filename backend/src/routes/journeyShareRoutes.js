const express = require('express');
const router = express.Router();
const { createLink, updateLiveLocation, getStatus } = require('../controllers/journeyShareController');
const { secure } = require('../middleware/middleware');

// Public route to view journey
router.get('/:token', getStatus);

// Protected routes
router.post('/start', secure, createLink);
router.post('/update', secure, updateLiveLocation); // In prod, maybe use websocket

module.exports = router;
