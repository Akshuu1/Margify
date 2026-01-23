const SavedRoute = require('../models/SavedRoute');

/**
 * Save a new route for a user
 */
const saveRoute = async (req, res) => {
    try {
        const { routeName, source, destination, preferences } = req.body;
        const userId = req.user._id; // Assuming auth middleware adds user to req

        // Validate required fields
        if (!routeName || !source || !destination) {
            return res.status(400).json({
                message: 'Route name, source, and destination are required'
            });
        }

        // Check if route with same name already exists for this user
        const existingRoute = await SavedRoute.findOne({ userId, routeName });
        if (existingRoute) {
            return res.status(400).json({
                message: 'A route with this name already exists'
            });
        }

        // Create new saved route
        const savedRoute = new SavedRoute({
            userId,
            routeName,
            source,
            destination,
            preferences: preferences || {}
        });

        await savedRoute.save();

        res.status(201).json({
            message: 'Route saved successfully',
            route: savedRoute
        });
    } catch (error) {
        console.error('Error saving route:', error);
        res.status(500).json({ message: 'Error saving route', error: error.message });
    }
};

/**
 * Get all saved routes for a user
 */
const getSavedRoutes = async (req, res) => {
    try {
        const userId = req.user._id;

        const routes = await SavedRoute.find({ userId })
            .sort({ lastUsed: -1 }) // Most recently used first
            .select('-__v');

        res.status(200).json({
            count: routes.length,
            routes
        });
    } catch (error) {
        console.error('Error fetching saved routes:', error);
        res.status(500).json({ message: 'Error fetching routes', error: error.message });
    }
};

/**
 * Get a specific saved route by ID
 */
const getSavedRouteById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const route = await SavedRoute.findOne({ _id: id, userId });

        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }

        // Update usage stats
        await route.recordUsage();

        res.status(200).json({ route });
    } catch (error) {
        console.error('Error fetching route:', error);
        res.status(500).json({ message: 'Error fetching route', error: error.message });
    }
};

/**
 * Update a saved route
 */
const updateSavedRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const updates = req.body;

        const route = await SavedRoute.findOneAndUpdate(
            { _id: id, userId },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }

        res.status(200).json({
            message: 'Route updated successfully',
            route
        });
    } catch (error) {
        console.error('Error updating route:', error);
        res.status(500).json({ message: 'Error updating route', error: error.message });
    }
};

/**
 * Delete a saved route
 */
const deleteSavedRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const route = await SavedRoute.findOneAndDelete({ _id: id, userId });

        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }

        res.status(200).json({
            message: 'Route deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting route:', error);
        res.status(500).json({ message: 'Error deleting route', error: error.message });
    }
};

/**
 * Save a specific route option (with segments)
 */
const saveRouteOption = async (req, res) => {
    try {
        const { routeName, source, destination, route } = req.body;
        const userId = req.user._id;

        if (!routeName || !source || !destination || !route) {
            return res.status(400).json({
                message: 'Route name, source, destination, and route details are required'
            });
        }

        const savedRoute = new SavedRoute({
            userId,
            routeName,
            source,
            destination,
            specificRoute: route
        });

        await savedRoute.save();

        res.status(201).json({
            message: 'Route option saved successfully',
            route: savedRoute
        });
    } catch (error) {
        console.error('Error saving route option:', error);
        res.status(500).json({ message: 'Error saving route option', error: error.message });
    }
};

module.exports = {
    saveRoute,
    saveRouteOption,
    getSavedRoutes,
    getSavedRouteById,
    updateSavedRoute,
    deleteSavedRoute
};
