const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const getProfile = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return res.json()
}
