const BASE_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? `http://${window.location.hostname}:3000` : `https://${window.location.hostname}`);

/**
 * Fetch cab prices for a given pickup → drop location.
 * Returns array of cab options with prices and deep links.
 * On failure, returns empty array (graceful degradation).
 */
export async function getCabPrices(fromLat, fromLng, toLat, toLng, distanceKm, fromName, toName) {
    try {
        const params = new URLSearchParams({
            fromLat: String(fromLat),
            fromLng: String(fromLng),
            toLat: String(toLat),
            toLng: String(toLng),
        });

        if (distanceKm) params.set('distanceKm', String(distanceKm));
        if (fromName) params.set('fromName', fromName);
        if (toName) params.set('toName', toName);

        const res = await fetch(`${BASE_URL}/api/cab/prices?${params.toString()}`);

        if (!res.ok) {
            console.warn('Cab price fetch failed:', res.status);
            return [];
        }

        const data = await res.json();
        return data.prices || [];
    } catch (err) {
        console.warn('Cab price fetch error:', err.message);
        return [];
    }
}
