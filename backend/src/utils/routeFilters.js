function isTemplateValid(template, distanceKm) {
    if (!template || template.length === 0) return false;

    const transitModes = ['METRO', 'TRAIN', 'PLANE', 'BUS'];
    const privateModes = ['CAB', 'AUTO', 'BIKE'];

    // 1. Plane only for very long distances
    if (template.includes('PLANE') && distanceKm < 300) return false;

    // 2. Train only for distances > 20km
    if (template.includes('TRAIN') && distanceKm < 20) return false;

    // 3. Metro only for distances > 5km
    if (template.includes('METRO') && distanceKm < 5) return false;

    // 4. Walk-only route for short distances
    if (template.length === 1 && template.includes('WALK') && distanceKm > 3) return false;

    // 5. Don't allow redundant private-mode switches (CAB->AUTO, BIKE->AUTO etc.)
    for (let i = 1; i < template.length; i++) {
        const prev = template[i - 1];
        const curr = template[i];
        if (privateModes.includes(prev) && privateModes.includes(curr) && prev !== curr) {
            return false;
        }
        // Block same transit mode repeating consecutively
        if (prev === curr && transitModes.includes(curr)) return false;
    }

    // 6. Block over-complex routes for short distances
    if (distanceKm < 15 && template.length > 3) return false;
    if (distanceKm < 5 && template.length > 2) return false;

    // 7. Block too many different transit types for medium distances
    const uniqueTransit = new Set(template.filter(m => transitModes.includes(m)));
    if (distanceKm < 30 && uniqueTransit.size > 2) return false;

    return true;
}

module.exports = { isTemplateValid };
