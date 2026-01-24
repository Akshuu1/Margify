const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:3000`;

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