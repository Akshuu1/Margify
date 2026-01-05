const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export async function searchPlaces(query) {
    try {
        const res = await fetch(`${BASE_URL}/api/map/search?query=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Search failed");
        return await res.json();
    } catch (error) {
        console.error("Place search error:", error);
        return [];
    }
}