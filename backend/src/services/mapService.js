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

async function findNearestPOI(location, query) {
    try {
        const response = await geocodingClient.forwardGeocode({
            query: query,
            proximity: [location.lng, location.lat],
            limit: 1,
            types: ['poi']
        }).send()

        if (response.body.features && response.body.features.length > 0) {
            const feature = response.body.features[0]
            return {
                name: feature.text,
                fullName: feature.place_name,
                coordinates: {
                    lng: feature.center[0],
                    lat: feature.center[1]
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