const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? `http://${window.location.hostname}:3000` : `https://${window.location.hostname}`);

export async function getRoutes(from, to, token, preferences) {
    const res = await fetch(`${BACKEND_URL}/api/routes/plan`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ from, to, preferences })
    })

    if (!res.ok) {
        throw new Error('Failed to fetch routes')
    }
    return res.json()
}