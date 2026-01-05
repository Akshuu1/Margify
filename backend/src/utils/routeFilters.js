function isTemplateValid(template, distanceKm) {
    if (template.length === 1 && template[0] === 'WALK' && distanceKm > 2) {
        return false
    }
    if (template.includes('PLANE') && distanceKm < 200) {
        return false
    }
    return true
}
module.exports = { isTemplateValid }
