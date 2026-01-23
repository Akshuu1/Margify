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

export const changePassword = async (oldPassword, newPassword) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
    })

    return res.json()
}
