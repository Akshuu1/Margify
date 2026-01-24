function isTemplateValid(template, distanceKm, weatherCondition = 'Clear') {
    if (!template) return false;

    const transitModes = ['METRO', 'TRAIN', 'PLANE'];
    const shortDistance = distanceKm < 10;
    const mediumDistance = distanceKm < 30;

    // 1. Complexity check: Short distances should NOT have too many transfers
    if (shortDistance && template.length > 3) {
        return false;
    }

    // 2. Transit relevance: Don't suggest Metro/Train for very short distances (~5-10km)
    // as the overhead of getting to/from station is higher than the journey
    if (shortDistance && (template.includes('METRO') || template.includes('TRAIN'))) {
        return false;
    }

    // 3. Plane relevance: Only for very long distances
    if (template.includes('PLANE') && distanceKm < 400) {
        return false;
    }

    // 4. Mode specific distance blocks
    if (template.includes('WALK') && distanceKm > 3) return false;
    if (template.includes('BIKE') && distanceKm > 15) return false;
    if (template.includes('AUTO') && distanceKm > 60) return false;

    // 5. Weather check
    if (weatherCondition && weatherCondition.toLowerCase().includes('rain')) {
        if (template.includes('WALK') || template.includes('BIKE')) {
            if (template.length === 1) return false;
        }
    }

    return true;
}

module.exports = { isTemplateValid };
