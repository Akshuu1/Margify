const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:3000`;
export const signupUser = async (data) => {
    try {
        const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (error) {
        console.error("Signup Error:", error);
        return { message: "Network error: Backend unreachable" };
    }
}
export const loginUser = async (data) => {
    try {
        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (error) {
        console.error("Login Error:", error);
        return { message: "Network error: Backend unreachable" };
    }
}
export const getProfile = async () => {
    try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) return await res.json()
        const text = await res.text();
        console.error("Profile Error:", text);
        return { error: "Failed to load profile (Non-JSON response)" };
    } catch (error) {
        console.error("Profile Fetch error:", error);
        return { error: "Network error" };
    }
}
export const changePassword = async (oldPassword, newPassword) => {
    try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ oldPassword, newPassword })
        })
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) return await res.json()
        const text = await res.text();
        console.error("Change Password Error:", text);
        return { error: res.status === 404 ? "Endpoint not found (404). Please restart backend." : "Failed to change password" };
    } catch (error) {
        console.error("Change Password error:", error);
        return { error: "Network error" };
    }
}
