const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const getProfile = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return res.json()
    } else {
        const text = await res.text();
        console.error("Profile Error:", text);
        return { error: "Failed to load profile (Non-JSON response)" };
    }
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

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return res.json()
    } else {
        const text = await res.text();
        console.error("Change Password Error:", text);
        return { error: res.status === 404 ? "Endpoint not found (404). Please restart backend." : "Failed to change password" };
    }
}

