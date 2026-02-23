const axios = require('axios');

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function getNearbyTouristPlaces(lat, lng, radius = 15000) {
    try {
        const keywords = ['monument', 'museum', 'fort', 'temple', 'mosque', 'church', 'palace', 'historical park', 'memorial', 'gate'];

        const allPlaces = [];

        for (const keyword of keywords.slice(0, 4)) {
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
            }
        }

        if (allPlaces.length === 0) {
            return [];
        }

        const uniquePlaces = Array.from(new Map(allPlaces.map(place => [place.place_id, place])).values());

        const genuineAttractions = uniquePlaces.filter(place => {
            const name = (place.name || '').toLowerCase();
            const types = place.types || [];

            const businessKeywords = ['collection', 'service', 'private', 'ltd', 'pvt', 'company', 'corporation',
                'shop', 'store', 'salon', 'clinic', 'hospital', 'hotel', 'restaurant',
                'cafe', 'bar', 'office', 'agency', 'consultant', 'builder', 'developer',
                'fountain', 'coaching', 'institute', 'school', 'college', 'bank', 'atm'
            ];

            const hasBusinessKeyword = businessKeywords.some(keyword => name.includes(keyword));
            if (hasBusinessKeyword) {
                return false;
            }

            const businessTypes = ['store', 'shopping_mall', 'restaurant', 'cafe', 'lodging', 'hospital',
                'doctor', 'pharmacy', 'bank', 'atm', 'gas_station', 'car_dealer',
                'real_estate_agency', 'lawyer', 'accounting', 'insurance_agency', 'car_rental'];

            const isPureBusiness = businessTypes.some(type => types.includes(type)) &&
                !types.includes('tourist_attraction') &&
                !types.includes('museum') &&
                !types.includes('park') &&
                !types.includes('place_of_worship');

            if (isPureBusiness) {
                return false;
            }

            const rating = place.rating || 0;
            const reviewCount = place.user_ratings_total || 0;

            return rating >= 4.0 && reviewCount >= 100;
        });

        const sortedPlaces = genuineAttractions.sort((a, b) => {
            const scoreA = (a.rating || 0) * (a.user_ratings_total || 0);
            const scoreB = (b.rating || 0) * (b.user_ratings_total || 0);
            return scoreB - scoreA;
        });

        const places = sortedPlaces.map(place => {
            let photoUrl = null;
            if (place.photos && place.photos.length > 0 && GOOGLE_PLACES_API_KEY) {
                photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`;
            }

            return {
                id: place.place_id,
                name: place.name,
                rating: place.rating || 0,
                userRatingsTotal: place.user_ratings_total || 0,
                vicinity: place.vicinity,
                location: {
                    lat: place.geometry.location.lat,
                    lng: place.geometry.location.lng
                },
                photo: photoUrl,
                types: place.types || []
            };
        });

        return places;
    } catch (error) {
        return [];
    }
}

async function getNearbyAmenities(lat, lng, radius = 2000) {
    try {
        const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
        const response = await axios.get(url, {
            params: {
                location: `${lat},${lng}`,
                radius: radius,
                type: 'restaurant|cafe|bakery',
                key: GOOGLE_PLACES_API_KEY
            }
        });

        if (response.data.status !== 'OK' || !response.data.results) return [];

        const qualityPlaces = response.data.results.filter(place => {
            const rating = place.rating || 0;
            const reviewCount = place.user_ratings_total || 0;
            const name = (place.name || '').toLowerCase();

            const genericNames = ['restaurant', 'cafe', 'food', 'snack', 'fast food', 'diner', 'eatery', 'joint', 'spot'];
            const isGenericName = genericNames.some(term => name.includes(term));

            if (rating < 3.5) return false;
            if (reviewCount < 20) return false;
            return true;
        });

        const sortedPlaces = qualityPlaces
            .sort((a, b) => {
                const scoreA = (a.rating || 0) * Math.log(a.user_ratings_total || 1);
                const scoreB = (b.rating || 0) * Math.log(b.user_ratings_total || 1);
                return scoreB - scoreA;
            })
            .slice(0, 8);

        return sortedPlaces.map(place => ({
            id: place.place_id,
            name: place.name,
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total || 0,
            vicinity: place.vicinity,
            photo: place.photos && place.photos.length > 0
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                : null
        }));
    } catch (error) {
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
            return null;
        }

        return response.data.result;
    } catch (error) {
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
    getNearbyAmenities,
    getPlaceDetails,
    getTouristPlacesAlongRoute
};
