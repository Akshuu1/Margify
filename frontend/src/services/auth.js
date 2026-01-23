import { BACKEND_URL } from '../config';

export const signupUser = async (data) => {
    try {
        const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
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
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (error) {
        console.error("Login Error:", error);
        return { message: "Network error: Backend unreachable" };
    }
}

