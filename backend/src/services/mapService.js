const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function getRouteMetrics(from, to, mode = 'DRIVE') {
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

        const requestBody = {
            origin: { location: { latLng: { latitude: from.lat, longitude: from.lng } } },
            destination: { location: { latLng: { latitude: to.lat, longitude: to.lng } } },
            travelMode: travelMode,
            departureTime: new Date().toISOString(), // Use current time for real-time traffic/transit
            routingPreference: 'TRAFFIC_AWARE', // Apply traffic awareness globally where supported
            computeAlternativeRoutes: false,
        };

        if (travelMode === 'TRANSIT') {
            const transitModes = [];
            if (mode === 'METRO') transitModes.push('SUBWAY');
            if (mode === 'BUS') transitModes.push('BUS');
            if (mode === 'TRAIN') transitModes.push('TRAIN');

            if (transitModes.length > 0) {
                requestBody.transitPreferences = {
                    allowedTravelModes: transitModes,
                    routingPreference: 'LESS_WALKING' // Focus on the transit mode requested
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
            const durationSeconds = parseInt(route.duration.replace('s', ''));

            let fare = null;
            if (route.travelAdvisory && route.travelAdvisory.transitFare) {
                const transitFare = route.travelAdvisory.transitFare;
                fare = {
                    amount: parseInt(transitFare.units),
                    currency: transitFare.currencyCode
                };
            }

            console.log(`Route Found [${mode}]: ${route.distanceMeters}m, ${durationSeconds}s`);

            return {
                distanceKm: route.distanceMeters / 1000,
                durationMin: Math.round(durationSeconds / 60),
                fare: fare,
                polyline: route.polyline?.encodedPolyline
            };
        } else {
            console.warn(`No route found for mode: ${mode}`);
            return { distanceKm: 0, durationMin: 0, fare: null };
        }
    } catch (error) {
        console.error("Routes API error:", error.message);
        return { distanceKm: 0, durationMin: 0, fare: null };
    }
}

const { extractTransitInfo } = require("../utils/transitUtils");
async function findNearestPOI(location, query, maxDist = 20) {
    try {
        const typeMap = {
            'metro': 'subway_station',
            'metro station': 'subway_station',
            'bus': 'bus_station',
            'bus station': 'bus_station',
            'bus stand': 'bus_station',
            'train': 'train_station',
            'railway station': 'train_station',
            'airport': 'airport'
        };

        const includedType = typeMap[query.toLowerCase()] || typeMap[query.toLowerCase().replace(' station', '')];
        if (includedType) {
            const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_KEY,
                    'X-Goog-FieldMask': 'places.displayName,places.location,places.formattedAddress,places.types'
                },
                body: JSON.stringify({
                    includedTypes: [includedType],
                    maxResultCount: 5,
                    rankPreference: "DISTANCE",
                    locationRestriction: {
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
                const transitInfo = extractTransitInfo(firstPOI.displayName.text, firstPOI.formattedAddress);

                return {
                    name: firstPOI.displayName.text,
                    fullName: firstPOI.formattedAddress,
                    coordinates: { lng: poiLng, lat: poiLat },
                    distance: 0,
                    types: firstPOI.types || [],
                    ...transitInfo
                };
            }
            return null;
        }
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
                        center: { latitude: location.lat, longitude: location.lng },
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

            const transitInfo = extractTransitInfo(firstPOI.displayName.text, firstPOI.formattedAddress);
            return {
                name: firstPOI.displayName.text,
                fullName: firstPOI.formattedAddress,
                coordinates: { lng: poiLng, lat: poiLat },
                distance: 0,
                types: firstPOI.types || [],
                ...transitInfo
            };
        }

    } catch (error) {
        console.error("Error finding POI with Google Places (New):", error.message);
    }
    return null;
}

async function getPlaceName(lng, lat) {
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