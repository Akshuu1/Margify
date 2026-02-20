import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? `http://${window.location.hostname}:3000` : `https://${window.location.hostname}`);

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
    throw error.response?.data || error;
  }
};

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
    throw error.response?.data || error;
  }
};

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
    throw error.response?.data || error;
  }
};

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
    throw error.response?.data || error;
  }
};

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
    throw error.response?.data || error;
  }
};

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
    throw error.response?.data || error;
  }
};
