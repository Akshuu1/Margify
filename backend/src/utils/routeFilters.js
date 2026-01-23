function isTemplateValid(template, distanceKm, weatherCondition = 'Clear') {
    // Hide walking completely for distances > 2km
    if (template.includes('WALK') && distanceKm > 2) {
        return false;
    }

    // Hide bike for distances > 10km
    if (template.includes('BIKE') && distanceKm > 10) {
        return false;
    }

    // Filter auto/rickshaw for very long distances > 30km
    if (template.includes('AUTO') && distanceKm > 30) {
        return false;
    }

    // Filter bus for very short distances < 1km
    if (template.length === 1 && template[0] === 'BUS' && distanceKm < 1) {
        return false;
    }

    // Filter plane for short distances < 200km
    if (template.includes('PLANE') && distanceKm < 200) {
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

