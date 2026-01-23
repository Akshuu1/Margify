const axios = require('axios');

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function getNearbyTouristPlaces(lat, lng, radius = 15000) {
    try {
        // Use keyword search for GENUINE tourist attractions
        const keywords = ['monument', 'museum', 'fort', 'temple', 'mosque', 'church', 'palace', 'historical park', 'memorial', 'gate'];

        const allPlaces = [];

        // Search with multiple keywords to get diverse results
        for (const keyword of keywords.slice(0, 4)) { // Use top 4 keywords
            try {
                const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
                const response = await axios.get(url, {
                    params: {
                        location: `${lat},${lng}`,
                        radius: radius,
                        keyword: keyword,
                        key: GOOGLE_PLACES_API_KEY
                    }
                });

                if (response.data.status === 'OK' && response.data.results) {
                    allPlaces.push(...response.data.results);
                }
            } catch (err) {
                console.error(`Error with keyword ${keyword}:`, err.message);
            }
        }

        if (allPlaces.length === 0) {
            console.log('No places found with keyword search');
            return [];
        }

        // Remove duplicates by place_id
        const uniquePlaces = Array.from(new Map(allPlaces.map(place => [place.place_id, place])).values());

        // STRICT FILTERING for genuine tourist attractions
        const genuineAttractions = uniquePlaces.filter(place => {
            const name = (place.name || '').toLowerCase();
            const types = place.types || [];

            // EXCLUDE business-like names and services
            const businessKeywords = ['collection', 'service', 'private', 'ltd', 'pvt', 'company', 'corporation',
                'shop', 'store', 'salon', 'clinic', 'hospital', 'hotel', 'restaurant',
                'cafe', 'bar', 'office', 'agency', 'consultant', 'builder', 'developer',
                'fountain', 'coaching', 'institute', 'school', 'college'
            ];

            const hasBusinessKeyword = businessKeywords.some(keyword => name.includes(keyword));
            if (hasBusinessKeyword) {
                return false;
            }

            // EXCLUDE pure business types
            const businessTypes = ['store', 'shopping_mall', 'restaurant', 'cafe', 'lodging', 'hospital',
                'doctor', 'pharmacy', 'bank', 'atm', 'gas_station', 'car_dealer',
                'real_estate_agency', 'lawyer', 'accounting', 'insurance_agency'];

            const isPureBusiness = businessTypes.some(type => types.includes(type)) &&
                !types.includes('tourist_attraction') &&
                !types.includes('museum') &&
                !types.includes('park') &&
                !types.includes('place_of_worship');

            if (isPureBusiness) {
                return false;
            }

            // REQUIRE high quality and sufficient reviews for MAJOR attractions
            const rating = place.rating || 0;
            const reviewCount = place.user_ratings_total || 0;

            // Only show places with 4.0+ rating AND at least 100 reviews for major attractions
            return rating >= 4.0 && reviewCount >= 100;
        });

        // Sort by significance (rating * review count)
        const sortedPlaces = genuineAttractions.sort((a, b) => {
            const scoreA = (a.rating || 0) * (a.user_ratings_total || 0);
            const scoreB = (b.rating || 0) * (b.user_ratings_total || 0);
            return scoreB - scoreA;
        });

        // Return ALL major attractions found (don't limit to 10)
        const places = sortedPlaces.map(place => ({
            id: place.place_id,
            name: place.name,
            rating: place.rating || 0,
            userRatingsTotal: place.user_ratings_total || 0,
            vicinity: place.vicinity,
            location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
            },
            photo: place.photos && place.photos.length > 0
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                : null,
            types: place.types || []
        }));

        console.log(`Found ${places.length} genuine tourist attractions (filtered from ${uniquePlaces.length} unique, ${allPlaces.length} raw)`);
        places.forEach(p => console.log(`  ✓ ${p.name} (${p.rating}⭐, ${p.userRatingsTotal.toLocaleString()} reviews)`));

        return places;
    } catch (error) {
        console.error('Error fetching tourist places:', error.message);
        return [];
    }
}

async function getPlaceDetails(placeId) {
    try {
        const url = 'https://maps.googleapis.com/maps/api/place/details/json';

        const response = await axios.get(url, {
            params: {
                place_id: placeId,
                fields: 'name,rating,formatted_address,opening_hours,website,formatted_phone_number,reviews,photos',
                key: GOOGLE_PLACES_API_KEY
            }
        });

        if (response.data.status !== 'OK') {
            console.error('Google Places Details API Error:', response.data.status);
            return null;
        }

        return response.data.result;
    } catch (error) {
        console.error('Error fetching place details:', error.message);
        return null;
    }
}

async function getTouristPlacesAlongRoute(routeCoordinates) {
    if (!routeCoordinates || routeCoordinates.length < 2) {
        return [];
    }

    const midpoint = routeCoordinates[Math.floor(routeCoordinates.length / 2)];
    const places = await getNearbyTouristPlaces(midpoint.lat, midpoint.lng, 15000);

    return places;
}

module.exports = {
    getNearbyTouristPlaces,
    getPlaceDetails,
    getTouristPlacesAlongRoute
};
