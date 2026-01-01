// Hardcoded for local debugging
const BACKEND_URL = 'http://localhost:3000';
// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const signupUser = async (data) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(data)
    })
    return res.json()
}
export const loginUser = async (data) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(data)
    })
    return res.json()
}

