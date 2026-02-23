function isTemplateValid(template, distanceKm) {
  if (!template || template.length === 0) return false;

  const transitModes = ['METRO', 'TRAIN', 'PLANE', 'BUS'];
  const privateModes = ['CAB', 'AUTO', 'BIKE'];

  // --- Distance-based mode restrictions ---
  // No flights under 500km (must be truly long-distance)
  if (template.includes('PLANE') && distanceKm < 500) return false;
  // No trains under 20km
  if (template.includes('TRAIN') && distanceKm < 20) return false;
  // No metro under 3km (walking distance)
  if (template.includes('METRO') && distanceKm < 3) return false;
  // Walk-only max 2km
  if (template.length === 1 && template.includes('WALK') && distanceKm > 2) return false;
  // Solo auto max 15km
  if (template.length === 1 && template[0] === 'AUTO' && distanceKm > 15) return false;
  // Solo bike max 20km
  if (template.length === 1 && template[0] === 'BIKE' && distanceKm > 20) return false;
  // No bus-only routes over 100km (inter-city bus needs a connection)
  if (template.length === 1 && template[0] === 'BUS' && distanceKm > 100) return false;

  // --- Illogical combo restrictions ---
  for (let i = 1; i < template.length; i++) {
    const prev = template[i - 1];
    const curr = template[i];
    // No two different private modes back-to-back (e.g. AUTO then BIKE)
    if (privateModes.includes(prev) && privateModes.includes(curr) && prev !== curr) {
      return false;
    }
    // No same transit mode back-to-back (e.g. BUS BUS)
    if (prev === curr && transitModes.includes(curr)) return false;
  }

  // --- Complexity limits based on distance ---
  // Short trips shouldn't have 4+ segments
  if (distanceKm < 10 && template.length > 3) return false;
  if (distanceKm < 5 && template.length > 2) return false;
  // Medium trips shouldn't use too many different transit types
  if (distanceKm < 30) {
    const uniqueTransit = new Set(template.filter(m => transitModes.includes(m)));
    if (uniqueTransit.size > 2) return false;
  }

  // --- No CAB for long distances (over 80km it's expensive and illogical as recommended) ---
  // Keep CAB as option but only as connector, not solo for long routes
  if (template.length === 1 && template[0] === 'CAB' && distanceKm > 80) return false;

  // --- No WALK segments in long-distance routes unless connecting ---
  if (distanceKm > 50 && template.length === 1 && template[0] === 'WALK') return false;

  return true;
}

module.exports = { isTemplateValid };
