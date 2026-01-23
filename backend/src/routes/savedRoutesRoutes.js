const express = require('express');
const router = express.Router();
const {
    saveRoute,
    saveRouteOption,
    getSavedRoutes,
    getSavedRouteById,
    updateSavedRoute,
    deleteSavedRoute
} = require('../controllers/savedRoutesController');
const { secure } = require('../middleware/middleware');

// All routes below require authentication
router.use(secure);

// @route   POST /api/saved-routes
// @desc    Save a new route
// @access  Private
router.post('/', saveRoute);

// @route   POST /api/saved-routes/save-option
// @desc    Save a specific route option
// @access  Private
router.post('/save-option', saveRouteOption);

// @route   GET /api/saved-routes
// @desc    Get all saved routes for user
// @access  Private
router.get('/', getSavedRoutes);

// @route   GET /api/saved-routes/:id
// @desc    Get a specific saved route
// @access  Private
router.get('/:id', getSavedRouteById);

// @route   PUT /api/saved-routes/:id
// @desc    Update a saved route
// @access  Private
router.put('/:id', updateSavedRoute);

// @route   DELETE /api/saved-routes/:id
// @desc    Delete a saved route
// @access  Private
router.delete('/:id', deleteSavedRoute);

module.exports = router;
