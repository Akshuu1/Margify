const mapBoxDirection = require('@mapbox/mapbox-sdk/services/directions')
const mapBoxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')

const directionClient = mapBoxDirection({
    accessToken: process.env.MAPBOX_TOKEN
})

const geocodingClient = mapBoxGeocoding({
    accessToken: process.env.MAPBOX_TOKEN
})

async function getDistance(from, to) {
    const res = await directionClient.getDirections({
        profile: 'driving',
        waypoints: [
            { coordinates: [from.lng, from.lat] },
            { coordinates: [to.lng, to.lat] },
        ]
    }).send()

    const distanceMeters = res.body.routes[0].distance
    return distanceMeters / 1000
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

async function findNearestPOI(location, query, maxDist = 50) {
    try {
        const response = await geocodingClient.forwardGeocode({
            query: query,
            proximity: [location.lng, location.lat],
            limit: 3,
            types: ['poi']
        }).send()

        if (response.body.features && response.body.features.length > 0) {
            // Find the first feature within maxDist
            for (const feature of response.body.features) {
                const dist = getHaversineDistance(
                    location.lat, location.lng,
                    feature.center[1], feature.center[0]
                );

                if (dist <= maxDist) {
                    return {
                        name: feature.text,
                        fullName: feature.place_name,
                        coordinates: {
                            lng: feature.center[0],
                            lat: feature.center[1]
                        },
                        distance: dist
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error finding POI:", error)
    }
    return null
}

async function getPlaceName(lng, lat) {
    try {
        const response = await geocodingClient.reverseGeocode({
            query: [lng, lat],
            types: ['place', 'locality'],
            limit: 1
        }).send()

        if (response.body.features && response.body.features.length > 0) {
            return response.body.features[0].text
        }
    } catch (error) {
        console.error("Error reverse geocoding:", error)
    }
    return "Unknown Place"
}

module.exports = { getDistance, findNearestPOI, getPlaceName }