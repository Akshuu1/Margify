export async function getRoutes(from, to, token) {
    const res = await fetch('http://localhost:5001/api/routes/plan', {
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