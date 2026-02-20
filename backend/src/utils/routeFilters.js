function isTemplateValid(template, distanceKm) {
  if (!template || template.length === 0) return false;

  const transitModes = ['METRO', 'TRAIN', 'PLANE', 'BUS'];
  const privateModes = ['CAB', 'AUTO', 'BIKE'];

  if (template.includes('PLANE') && distanceKm < 300) return false;
  if (template.includes('TRAIN') && distanceKm < 20) return false;
  if (template.includes('METRO') && distanceKm < 5) return false;
  if (template.length === 1 && template.includes('WALK') && distanceKm > 3) return false;

  for (let i = 1; i < template.length; i++) {
    const prev = template[i - 1];
    const curr = template[i];
    if (privateModes.includes(prev) && privateModes.includes(curr) && prev !== curr) {
      return false;
    }
    if (prev === curr && transitModes.includes(curr)) return false;
  }

  if (distanceKm < 15 && template.length > 3) return false;
  if (distanceKm < 5 && template.length > 2) return false;

  const uniqueTransit = new Set(template.filter(m => transitModes.includes(m)));
  if (distanceKm < 30 && uniqueTransit.size > 2) return false;

  return true;
}

module.exports = { isTemplateValid };
