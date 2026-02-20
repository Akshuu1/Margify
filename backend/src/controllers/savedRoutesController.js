const SavedRoute = require('../models/SavedRoute');

const saveRoute = async (req, res) => {
  try {
    const { routeName, source, destination, preferences } = req.body;
    const userId = req.user._id;

    if (!routeName || !source || !destination) {
      return res.status(400).json({
        message: 'Route name, source, and destination are required'
      });
    }

    const existingRoute = await SavedRoute.findOne({ userId, routeName });
    if (existingRoute) {
      return res.status(400).json({
        message: 'A route with this name already exists'
      });
    }

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
    res.status(500).json({ message: 'Error saving route', error: error.message });
  }
};

const getSavedRoutes = async (req, res) => {
  try {
    const userId = req.user._id;
    const routes = await SavedRoute.find({ userId })
      .sort({ lastUsed: -1 })
      .select('-__v');
    res.status(200).json({
      count: routes.length,
      routes
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching routes', error: error.message });
  }
};

const getSavedRouteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const route = await SavedRoute.findOne({ _id: id, userId });

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    await route.recordUsage();
    res.status(200).json({ route });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching route', error: error.message });
  }
};

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
    res.status(500).json({ message: 'Error updating route', error: error.message });
  }
};

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
    res.status(500).json({ message: 'Error deleting route', error: error.message });
  }
};

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
