// Use the same backend URL as other services
// Hardcoded for local debugging
const BACKEND_URL = 'http://localhost:3000';
// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const getProfile = async () => {
    const token = localStorage.getItem('token')
    // Changed path to /api/auth/profile to match backend routes
    const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return res.json()
}
