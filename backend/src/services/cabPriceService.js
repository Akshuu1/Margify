/**
 * Cab Price Estimation Service
 * 
 * Uses real-world pricing formulas for Indian ride-hailing apps.
 * No external API needed — this is the same approach used by Citymapper / Rome2Rio.
 * 
 * Pricing model: baseFare + (perKm * distance) + (perMin * estimatedTime) + surgeMultiplier
 */

// Pricing configs for different cab types (INR, Indian cities)
const CAB_PROVIDERS = {
    uber_go: {
        name: 'Uber Go',
        provider: 'uber',
        icon: '🚗',
        baseFare: 40,
        perKm: 11,
        perMin: 1.5,
        minFare: 50,
        maxFarePerKm: 18, // cap for very long trips
        color: '#276EF1',
        bookingFee: 15,
    },
    uber_auto: {
        name: 'Uber Auto',
        provider: 'uber',
        icon: '🛺',
        baseFare: 25,
        perKm: 7,
        perMin: 1,
        minFare: 30,
        maxFarePerKm: 12,
        color: '#276EF1',
        bookingFee: 5,
    },
    uber_premier: {
        name: 'Uber Premier',
        provider: 'uber',
        icon: '🚘',
        baseFare: 80,
        perKm: 16,
        perMin: 2,
        minFare: 100,
        maxFarePerKm: 22,
        color: '#276EF1',
        bookingFee: 20,
    },
    ola_mini: {
        name: 'Ola Mini',
        provider: 'ola',
        icon: '🚗',
        baseFare: 35,
        perKm: 10,
        perMin: 1.5,
        minFare: 50,
        maxFarePerKm: 16,
        color: '#68B64F',
        bookingFee: 10,
    },
    ola_prime: {
        name: 'Ola Prime',
        provider: 'ola',
        icon: '🚘',
        baseFare: 70,
        perKm: 14,
        perMin: 2,
        minFare: 90,
        maxFarePerKm: 20,
        color: '#68B64F',
        bookingFee: 15,
    },
    ola_auto: {
        name: 'Ola Auto',
        provider: 'ola',
        icon: '🛺',
        baseFare: 25,
        perKm: 8,
        perMin: 1,
        minFare: 30,
        maxFarePerKm: 12,
        color: '#68B64F',
        bookingFee: 5,
    },
    rapido_bike: {
        name: 'Rapido Bike',
        provider: 'rapido',
        icon: '🏍️',
        baseFare: 15,
        perKm: 5,
        perMin: 0.75,
        minFare: 20,
        maxFarePerKm: 8,
        color: '#FFD500',
        bookingFee: 5,
    },
    rapido_auto: {
        name: 'Rapido Auto',
        provider: 'rapido',
        icon: '🛺',
        baseFare: 20,
        perKm: 7,
        perMin: 1,
        minFare: 25,
        maxFarePerKm: 11,
        color: '#FFD500',
        bookingFee: 5,
    },
};

/**
 * Get surge multiplier based on current time.
 * Peak hours: 8-10 AM, 5-8 PM (1.2-1.5x)
 * Late night: 11 PM - 5 AM (1.3x)
 * Normal: 1.0x
 */
function getSurgeMultiplier() {
    const hour = new Date().getHours();

    if (hour >= 8 && hour <= 10) return 1.3;   // Morning rush
    if (hour >= 17 && hour <= 20) return 1.4;  // Evening rush
    if (hour >= 21 && hour <= 23) return 1.2;  // Late evening
    if (hour >= 0 && hour <= 5) return 1.3;    // Late night
    return 1.0;                                 // Normal
}

/**
 * Estimate travel time in minutes based on distance.
 * Average city speed: ~20 km/h (accounting for traffic)
 */
function estimateTravelTime(distanceKm) {
    if (distanceKm <= 0) return 5;
    const avgSpeedKmh = distanceKm > 20 ? 30 : 20; // Faster on highways
    return Math.max(5, Math.round((distanceKm / avgSpeedKmh) * 60));
}

/**
 * Calculate fare for a specific cab type.
 * Returns { min, max } range (±10% for traffic variation)
 */
function calculateFare(cabConfig, distanceKm, surgeMultiplier) {
    const travelTimeMin = estimateTravelTime(distanceKm);

    let fare = cabConfig.baseFare
        + (cabConfig.perKm * distanceKm)
        + (cabConfig.perMin * travelTimeMin)
        + cabConfig.bookingFee;

    // Apply surge
    fare *= surgeMultiplier;

    // Apply minimum fare
    fare = Math.max(fare, cabConfig.minFare);

    // Cap per-km rate for very long trips
    const effectivePerKm = fare / Math.max(distanceKm, 1);
    if (effectivePerKm > cabConfig.maxFarePerKm && distanceKm > 5) {
        fare = cabConfig.maxFarePerKm * distanceKm + cabConfig.bookingFee;
    }

    // Round to nearest 5
    fare = Math.round(fare / 5) * 5;

    return {
        min: fare,
        max: Math.round(fare * 1.15 / 5) * 5, // +15% for traffic variation
    };
}

/**
 * Generate deep link URLs for cab booking apps.
 * Each provider has different URI schemes.
 * Returns { app, web, fallback } URLs.
 */
function generateDeepLinks(provider, fromLat, fromLng, toLat, toLng, fromName, toName) {
    const encodedFrom = encodeURIComponent(fromName || 'Pickup');
    const encodedTo = encodeURIComponent(toName || 'Drop');

    const fallback = `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&travelmode=driving`;

    switch (provider) {
        case 'uber':
            return {
                app: `uber://?action=setPickup&pickup[latitude]=${fromLat}&pickup[longitude]=${fromLng}&pickup[nickname]=${encodedFrom}&dropoff[latitude]=${toLat}&dropoff[longitude]=${toLng}&dropoff[nickname]=${encodedTo}`,
                web: `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${fromLat}&pickup[longitude]=${fromLng}&dropoff[latitude]=${toLat}&dropoff[longitude]=${toLng}`,
                fallback,
            };
        case 'ola':
            return {
                app: `olacabs://app/launch?lat=${fromLat}&lng=${fromLng}&drop_lat=${toLat}&drop_lng=${toLng}`,
                web: `https://book.olacabs.com/?lat=${fromLat}&lng=${fromLng}&drop_lat=${toLat}&drop_lng=${toLng}`,
                fallback,
            };
        case 'rapido':
            return {
                app: `rapido://ride?pickup_lat=${fromLat}&pickup_lng=${fromLng}&drop_lat=${toLat}&drop_lng=${toLng}`,
                web: `https://www.rapido.bike/`,
                fallback,
            };
        default:
            return { app: fallback, web: fallback, fallback };
    }
}

/**
 * Main export: Get all cab prices for a given trip.
 * 
 * @param {number} fromLat 
 * @param {number} fromLng 
 * @param {number} toLat 
 * @param {number} toLng 
 * @param {number} distanceKm - Pre-calculated driving distance
 * @param {string} fromName - Optional pickup name
 * @param {string} toName - Optional drop name
 * @returns {Array} Array of cab options with prices and booking links
 */
function getCabPrices(fromLat, fromLng, toLat, toLng, distanceKm, fromName, toName) {
    // Edge case: if distance not provided, estimate from coordinates
    if (!distanceKm || distanceKm <= 0) {
        const R = 6371;
        const dLat = (toLat - fromLat) * Math.PI / 180;
        const dLng = (toLng - fromLng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distanceKm *= 1.3; // Road distance is ~30% more than straight line
    }

    const surgeMultiplier = getSurgeMultiplier();
    const travelTimeMin = estimateTravelTime(distanceKm);
    const surgeLabel = surgeMultiplier > 1.0
        ? (surgeMultiplier >= 1.3 ? 'Peak pricing' : 'Slight surge')
        : 'Normal pricing';

    const results = [];

    for (const [key, config] of Object.entries(CAB_PROVIDERS)) {
        // Filter out bikes for long trips (>25km) and autos for very long trips (>40km)
        if (key.includes('bike') && distanceKm > 25) continue;
        if (key.includes('auto') && distanceKm > 40) continue;
        // Filter out premium for very short trips (<3km)
        if ((key.includes('premier') || key.includes('prime')) && distanceKm < 3) continue;

        const price = calculateFare(config, distanceKm, surgeMultiplier);
        const deepLinks = generateDeepLinks(config.provider, fromLat, fromLng, toLat, toLng, fromName, toName);

        results.push({
            id: key,
            name: config.name,
            provider: config.provider,
            icon: config.icon,
            color: config.color,
            price,
            eta: Math.round(3 + Math.random() * 7), // Simulated ETA: 3-10 min
            travelTime: travelTimeMin,
            distance: Math.round(distanceKm * 10) / 10,
            surge: surgeMultiplier,
            surgeLabel,
            deepLinks,
        });
    }

    // Sort by cheapest first
    results.sort((a, b) => a.price.min - b.price.min);

    return results;
}

module.exports = { getCabPrices, CAB_PROVIDERS, getSurgeMultiplier };
