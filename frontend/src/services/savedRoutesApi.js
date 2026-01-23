import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/**
 * Save a route for the user
 */
export const saveRoute = async (routeData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
            `${BACKEND_URL}/api/saved-routes`,
            routeData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error saving route:', error);
        throw error.response?.data || error;
    }
};

/**
 * Get all saved routes for the logged-in user
 */
export const getSavedRoutes = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BACKEND_URL}/api/saved-routes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching saved routes:', error);
        throw error.response?.data || error;
    }
};

/**
 * Get a specific saved route by ID
 */
export const getSavedRouteById = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BACKEND_URL}/api/saved-routes/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching route:', error);
        throw error.response?.data || error;
    }
};

/**
 * Update a saved route
 */
export const updateSavedRoute = async (id, updateData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
            `${BACKEND_URL}/api/saved-routes/${id}`,
            updateData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating route:', error);
        throw error.response?.data || error;
    }
};

/**
 * Delete a saved route
 */
export const deleteSavedRoute = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${BACKEND_URL}/api/saved-routes/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting route:', error);
        throw error.response?.data || error;
    }
};
/**
 * Save a specific route option (with segments)
 */
export const saveRouteOption = async (saveData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
            `${BACKEND_URL}/api/saved-routes/save-option`,
            saveData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error saving route option:', error);
        throw error.response?.data || error;
    }
};
