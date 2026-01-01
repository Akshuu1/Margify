// Hardcoded for local debugging
const BACKEND_URL = 'http://localhost:3000';
// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export async function getRoutes(from, to, token) {
    const res = await fetch(`${BACKEND_URL}/api/routes/plan`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ from, to })
    })

    if (!res.ok) {
        throw new Error('Failed to fetch routes')
    }
    return res.json()
}