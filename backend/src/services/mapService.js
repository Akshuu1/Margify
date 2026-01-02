const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function getDistance(from, to) {
    try {
        const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_KEY,
                'X-Goog-FieldMask': 'routes.distanceMeters'
            },
            body: JSON.stringify({
                origin: { location: { latLng: { latitude: from.lat, longitude: from.lng } } },
                destination: { location: { latLng: { latitude: to.lat, longitude: to.lng } } },
                travelMode: 'DRIVE'
            })
        });

        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
            return data.routes[0].distanceMeters / 1000;
        }
    } catch (error) {
        console.error("Routes API error, using haversine fallback:", error.message);
    }

    // Fallback to haversine
    return getHaversineDistance(from.lat, from.lng, to.lat, to.lng);
}

const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Extract transit line information from place name
 */
function extractTransitInfo(placeName, formattedAddress) {
    const info = {
        lineName: null,
        stationCode: null,
        lineColor: null
    };

    // Extract metro line patterns (e.g., "Red Line", "Blue Line Metro Station")
    const linePatterns = [
        /\b(Red|Blue|Yellow|Green|Violet|Pink|Magenta|Grey|Orange|Aqua|Purple)\s+Line\b/i,
        /Metro\s+Line\s+(\d+)/i,
        /Line\s+(\d+)/i
    ];

    for (const pattern of linePatterns) {
        const match = placeName.match(pattern) || formattedAddress?.match(pattern);
        if (match) {
            info.lineName = match[0];
            // Assign colors based on line names
            const colorMap = {
                'red': '#FF0000',
                'blue': '#0000FF',
                'yellow': '#FFD700',
                'green': '#00FF00',
                'violet': '#8B00FF',
                'pink': '#FF69B4',
                'magenta': '#FF00FF',
                'grey': '#808080',
                'orange': '#FFA500',
                'aqua': '#00FFFF',
                'purple': '#800080'
            };
            const colorKey = match[1]?.toLowerCase();
            info.lineColor = colorMap[colorKey] || '#888888';
            break;
        }
    }

    // Extract station codes (e.g., "RJC", "CP")
    const codeMatch = placeName.match(/\b([A-Z]{2,4})\b/);
    if (codeMatch) {
        info.stationCode = codeMatch[1];
    }

    return info;
}

/**
 * Find the nearest POI using Google Places API (New)
 */
async function findNearestPOI(location, query, maxDist = 50) {
    try {
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_KEY,
                'X-Goog-FieldMask': 'places.displayName,places.location,places.formattedAddress,places.types'
            },
            body: JSON.stringify({
                textQuery: query,
                locationBias: {
                    circle: {
                        center: {
                            latitude: location.lat,
                            longitude: location.lng
                        },
                        radius: maxDist * 1000
                    }
                }
            })
        });

        const data = await response.json();

        if (data.places && data.places.length > 0) {
            const firstPOI = data.places[0];
            const poiLat = firstPOI.location.latitude;
            const poiLng = firstPOI.location.longitude;

            const dist = getHaversineDistance(location.lat, location.lng, poiLat, poiLng);

            if (dist <= maxDist) {
                const transitInfo = extractTransitInfo(
                    firstPOI.displayName.text,
                    firstPOI.formattedAddress
                );

                return {
                    name: firstPOI.displayName.text,
                    fullName: firstPOI.formattedAddress,
                    coordinates: {
                        lng: poiLng,
                        lat: poiLat
                    },
                    distance: dist,
                    types: firstPOI.types || [],
                    ...transitInfo
                };
            }
        }
    } catch (error) {
        console.error("Error finding POI with Google Places (New):", error.message);
    }
    return null;
}

/**
 * Reverse geocoding to get a readable place name using Geocoding API or Places API
 */
async function getPlaceName(lng, lat) {
    try {
        // Try Geocoding API first
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_KEY}`);
        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const locality = data.results[0].address_components.find(c => c.types.includes('locality'));
            return locality?.long_name || data.results[0].formatted_address.split(',')[0];
        }
    } catch (error) {
        console.error("Error reverse geocoding:", error.message);
    }
    return "Unknown Place";
}

module.exports = { getDistance, findNearestPOI, getPlaceName };