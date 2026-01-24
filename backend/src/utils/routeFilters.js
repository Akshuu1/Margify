function isTemplateValid(template, distanceKm, weatherCondition = 'Clear') {
    if (!template) {
        console.error('ERROR: isTemplateValid received undefined template:', template);
        return false;
    }

    // Hide walking completely for distances > 2km
    if (template.includes('WALK') && distanceKm > 2) {
        return false;
    }

    // Hide bike for distances > 10km
    if (template.includes('BIKE') && distanceKm > 10) {
        return false;
    }

    // Filter auto/rickshaw for long distances > 50km
    if (template.includes('AUTO') && distanceKm > 50) {
        return false;
    }

    // Filter bus for very short distances < 1km
    if (template.length === 1 && template[0] === 'BUS' && distanceKm < 1) {
        return false;
    }

    // Filter plane for short distances < 500km
    if (template.includes('PLANE') && distanceKm < 500) {
        return false;
    }

    // Filter walk/bike in heavy rain (if weather data available)
    if (weatherCondition && weatherCondition.toLowerCase().includes('rain')) {
        if (template.includes('WALK') || template.includes('BIKE')) {
            // Only allow if combined with other modes
            if (template.length === 1) {
                return false;
            }
        }
    }

    return true;
}

module.exports = { isTemplateValid };
