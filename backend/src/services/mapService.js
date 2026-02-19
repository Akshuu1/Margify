// Access API key dynamically to ensure it's loaded after dotenv
const getApiKey = () => process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

const { extractTransitInfo } = require("../utils/transitUtils");

async function getRouteMetrics(from, to, mode = 'DRIVE') {
    const GOOGLE_KEY = getApiKey();
    try {
        const modeMap = {
            'CAB': 'DRIVE',
            'AUTO': 'TWO_WHEELER',
            'BIKE': 'BICYCLE',
            'WALK': 'WALK',
            'BUS': 'TRANSIT',
            'METRO': 'TRANSIT',
            'TRAIN': 'TRANSIT'
        };
        const travelMode = modeMap[mode] || 'DRIVE';

        const departureTime = new Date(Date.now() + 120000).toISOString();

        const requestBody = {
            origin: { location: { latLng: { latitude: from.lat, longitude: from.lng } } },
            destination: { location: { latLng: { latitude: to.lat, longitude: to.lng } } },
            travelMode: travelMode,
            departureTime,
            computeAlternativeRoutes: false,
        };

        if (travelMode === 'DRIVE' || travelMode === 'TWO_WHEELER') {
            requestBody.routingPreference = 'TRAFFIC_AWARE';
        }

        if (travelMode === 'TRANSIT') {
            const transitModes = [];
            if (mode === 'METRO') transitModes.push('SUBWAY');
            if (mode === 'BUS') transitModes.push('BUS');
            if (mode === 'TRAIN') transitModes.push('TRAIN');

            if (transitModes.length > 0) {
                requestBody.transitPreferences = {
                    allowedTravelModes: transitModes,
                    routingPreference: 'LESS_WALKING'
                };
            }
        }

        const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_KEY,
                'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.travelAdvisory.transitFare,routes.polyline.encodedPolyline'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (data.error) {
            console.error(`Routes API Error [${mode}]:`, data.error.message);
            return { distanceKm: 0, durationMin: 0, fare: null };
        }

        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const durationSeconds = parseInt(route.duration.replace('s', '')) || 0;

            let fare = null;
            if (route.travelAdvisory && route.travelAdvisory.transitFare) {
                const transitFare = route.travelAdvisory.transitFare;
                const units = parseInt(transitFare.units);
                if (!isNaN(units)) {
                    fare = {
                        amount: units,
                        currency: transitFare.currencyCode || 'INR'
                    };
                }
            }

            return {
                distanceKm: (route.distanceMeters || 0) / 1000,
                durationMin: Math.round(durationSeconds / 60),
                fare: fare,
                polyline: route.polyline?.encodedPolyline
            };
        } else {
            return { distanceKm: 0, durationMin: 0, fare: null };
        }
    } catch (error) {
        console.error("Routes API error:", error.message);
        return { distanceKm: 0, durationMin: 0, fare: null };
    }
}

async function findNearestPOI(location, query, maxDist = 20) {
    const GOOGLE_KEY = getApiKey();
    if (!GOOGLE_KEY) return null;

    const safeRadius = Math.min(maxDist * 1000, 50000);

    try {
        const typeMap = {
            'metro': ['subway_station'],
            'metro station': ['subway_station'],
            'bus': ['bus_station', 'transit_station', 'bus_stop'],
            'bus station': ['bus_station', 'transit_station'],
            'bus stand': ['bus_station', 'transit_station', 'bus_stop'],
            'train': ['train_station'],
            'railway station': ['train_station'],
            'airport': ['airport']
        };

        let includedTypes = typeMap[query.toLowerCase()] || [typeMap[query.toLowerCase().replace(' station', '')]?.[0] || 'transit_station'];
        let places = [];

        const isSonipatArea = location.lat > 28.9 && location.lat < 29.1;

        const filterPOI = (list) => {
            return list.filter(p => {
                const name = p.displayName?.text?.toLowerCase() || "";
                const address = (p.formattedAddress || "").toLowerCase();
                const types = (p.types || []).map(t => t.toLowerCase());

                const blacklist = ['police', 'booth', 'chowki', 'post', 'security', 'checkpoint'];
                let isBlacklisted = blacklist.some(term => name.includes(term) || address.includes(term) || types.includes(term));

                if (isSonipatArea && query.toLowerCase().includes('bus')) {
                    if (name.includes('narela') || name.includes('bawana')) return false;
                }

                if (isBlacklisted) return false;
                return true;
            });
        };

        const forceTextSearch = (isSonipatArea && query.toLowerCase().includes('bus')) || query.toLowerCase().includes('terminal');

        if (includedTypes && !forceTextSearch) {
            const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_KEY,
                    'X-Goog-FieldMask': 'places.displayName,places.location,places.formattedAddress,places.types'
                },
                body: JSON.stringify({
                    includedTypes: Array.isArray(includedTypes) ? includedTypes : [includedTypes],
                    maxResultCount: 20,
                    rankPreference: "DISTANCE",
                    locationRestriction: {
                        circle: {
                            center: { latitude: location.lat, longitude: location.lng },
                            radius: safeRadius
                        }
                    }
                })
            });
            const data = await response.json();
            places = filterPOI(data.places || []);
        }

        if (places.length === 0 || forceTextSearch) {
            let refinedQuery = query;
            if (query.toLowerCase().includes('bus')) {
                refinedQuery = isSonipatArea ? "Sonipat Bus Stand Terminal Haryana" : "Major Bus Stand Terminal ISBT";
            } else if (query.toLowerCase().includes('metro')) {
                refinedQuery = isSonipatArea ? "Samaypur Badli Metro Station" : "Metro Station Delhi NCR Junction";
            } else {
                refinedQuery = `${query} near ${location.name || ''}`;
            }

            const responseText = await fetch('https://places.googleapis.com/v1/places:searchText', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_KEY,
                    'X-Goog-FieldMask': 'places.displayName,places.location,places.formattedAddress,places.types'
                },
                body: JSON.stringify({
                    textQuery: refinedQuery,
                    locationBias: {
                        circle: {
                            center: { latitude: location.lat, longitude: location.lng },
                            radius: safeRadius
                        }
                    },
                    maxResultCount: 20
                })
            });

            const dataText = await responseText.json();
            const textPlaces = filterPOI(dataText.places || []);

            if (textPlaces.length > 0) {
                if (forceTextSearch) places = textPlaces;
                else places = [...textPlaces, ...places];
            }
        }

        if (places && places.length > 0) {
            const calculateScore = (p) => {
                const name = p.displayName.text.toLowerCase();
                const lat = p.location.latitude;
                const lng = p.location.longitude;
                const dist = Math.sqrt(Math.pow(lat - location.lat, 2) + Math.pow(lng - location.lng, 2));

                let score = dist * 1000;

                if (name.includes('terminal') || name.includes('isbt') || name.includes('stand') || name.includes('junction')) {
                    score -= 50;
                }

                if (isSonipatArea && name.includes('sonipat')) score -= 40;

                return score;
            };

            const sortedPlaces = places.sort((a, b) => calculateScore(a) - calculateScore(b));
            const selectedMatch = sortedPlaces[0];

            const poiLat = selectedMatch.location.latitude;
            const poiLng = selectedMatch.location.longitude;
            const transitInfo = extractTransitInfo(selectedMatch.displayName.text, selectedMatch.formattedAddress);

            return {
                name: selectedMatch.displayName.text,
                fullName: selectedMatch.formattedAddress,
                coordinates: { lng: poiLng, lat: poiLat },
                distance: 0,
                types: selectedMatch.types || [],
                ...transitInfo
            };
        }

    } catch (error) {
        console.error("❌ [POI Error]:", error.message);
    }
    return null;
}

async function getPlaceName(lng, lat) {
    const GOOGLE_KEY = getApiKey();
    try {
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

module.exports = { getRouteMetrics, findNearestPOI, getPlaceName };