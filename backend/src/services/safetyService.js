/**
 * Calculate safety score for a route based on mode, time, and location
 * Score range: 0 (Dangerous) to 100 (Safe)
 */
const calculateSafetyScore = (route, crowdDensity = 'medium', weatherCondition = 'Clear') => {
    let score = 100;

    // 1. Mode Adjustment
    const modeSafety = {
        'WALKING': 85,
        'BICYCLING': 80,
        'TRANSIT': 95,
        'DRIVING': 90
    };

    let minModeScore = 100;
    route.segments?.forEach(seg => {
        const val = modeSafety[seg.travelMode] || 90;
        if (val < minModeScore) minModeScore = val;
    });
    score = minModeScore;

    // 2. Time Adjustment
    const hours = new Date().getHours();
    const isNight = hours < 6 || hours > 21;
    if (isNight) {
        score -= (minModeScore <= 85) ? 15 : 5;
    }

    // 3. Crowd Factor (Safety in numbers vs Overcrowding)
    // Low crowd at night might be unsafe
    if (crowdDensity === 'low' && isNight) score -= 10;
    // Extreme crowd might allow pickpocketing (minor deduction)
    if (crowdDensity === 'high') score -= 2;

    // 4. Weather Factor
    const badWeather = ['Rain', 'Snow', 'Thunderstorm'].includes(weatherCondition);
    if (badWeather) {
        if (route.segments?.some(s => s.travelMode === 'BICYCLING')) score -= 20; // Very dangerous to bike in rain
        if (route.segments?.some(s => s.travelMode === 'WALKING')) score -= 10;
        if (route.segments?.some(s => s.travelMode === 'DRIVING')) score -= 5;
    }

    return Math.max(0, Math.min(100, score));
};

/**
 * Get active safety alerts for an area
 */
const getSafetyAlerts = async (lat, lng) => {
    // Mock alerts
    return null;
};

module.exports = {
    calculateSafetyScore,
    getSafetyAlerts
};
