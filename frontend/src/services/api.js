const BASE_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? `http://${window.location.hostname}:3000` : `https://${window.location.hostname}`);

export async function searchPlaces(query) {
  try {
    const res = await fetch(`${BASE_URL}/api/map/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Search failed");
    return await res.json();
  } catch (error) {
    return [];
  }
}