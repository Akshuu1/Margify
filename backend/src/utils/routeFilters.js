function  isTemplateValid (template,distanceKm){
    if (template.includes('WALK') && distanceKm > 2){
        return false
    }
    if (template.includes('PLANE') && distanceKm < 200){
        return false
    }
    return true
}
module.exports = {isTemplateValid}

/*
  🔮 FUTURE (GOOGLE PLACES / TRANSIT)
  ----------------------------------
  With Google Places API we can enhance rules:
  - Remove TRAIN if no nearby station
  - Remove METRO if city has no metro
  - Add FERRY / TRAM dynamically

  This logic will stay here.
*/