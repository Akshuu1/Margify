function isTemplateValid(template, distanceKm, weatherCondition = 'Clear') {
    if (!template) return false;

    const transitModes = ['METRO', 'TRAIN', 'PLANE', 'BUS'];
    const highOverhead = ['METRO', 'TRAIN', 'PLANE'];
    const privateModes = ['CAB', 'AUTO', 'BIKE'];

    const isShort = distanceKm < 15;
    const isMedium = distanceKm < 40;

    // 1. Complexity check: Simple is better for local
    if (isShort && template.length > 3) return false;
    if (distanceKm < 5 && template.length > 2) return false;

    // 2. Practicality: CAB as access mode for LOCAL transit is "faaltu"
    // Taking a cab to a station for an 8km trip is practically impossible/illogical
    if (distanceKm < 20 && template.includes('CAB') && (template.includes('METRO') || template.includes('TRAIN') || template.includes('BUS'))) {
        // Only allow if it's the PURER CAB leg. But if it's CAB -> METRO -> CAB, block.
        if (template.length > 1) return false;
    }

    // 3. Mode compatibility logic
    for (let i = 1; i < template.length; i++) {
        const prev = template[i - 1];
        const curr = template[i];

        // Block redundant switch: CAB <-> AUTO
        if (privateModes.includes(prev) && privateModes.includes(curr) && prev !== curr) {
            return false;
        }

        // Block Repetitive transit (already handled by templates mostly, but safe guard)
        if (prev === curr && transitModes.includes(curr)) return false;
    }

    // 4. Distance floor for high-overhead transit
    if (distanceKm < 10 && (template.includes('TRAIN') || template.includes('METRO'))) {
        return false;
    }

    // 5. Plane relevance
    if (template.includes('PLANE') && distanceKm < 400) return false;

    // 6. Mode specific maximums (Pure)
    if (template.length === 1) {
        if (template.includes('WALK') && distanceKm > 3) return false;
        if (template.includes('BIKE') && distanceKm > 30) return false;
        if (template.includes('AUTO') && distanceKm > 40) return false;
    }

    // 7. Logical combinations
    // BUS -> BUS or METRO -> METRO is handled by Google as one leg.
    // Combinations like METRO -> TRAIN -> BUS for 20km is over-engineering.
    const uniqueTransit = new Set(template.filter(m => transitModes.includes(m)));
    if (distanceKm < 30 && uniqueTransit.size > 2) return false;

    // 8. Auto/Bike as access for Bus/Metro is okay, but CAB -> BUS -> CAB is not.
    if (distanceKm < 60 && template.includes('BUS') && template.includes('CAB')) return false;

    return true;
}

module.exports = { isTemplateValid };
