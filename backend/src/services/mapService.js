const mapBoxDirection = require('@mapbox/mapbox-sdk/services/directions')

const directionClient = mapBoxDirection({
    accessToken: process.env.MAPBOX_TOKEN
})

async function getDistance(from,to){
    const res = await directionClient.getDirections({
        profile:'driving' , 
        waypoints:[
            {coordinates : [from.lng , from.lat]},
            {coordinates : [to.lng , to.lat]},
        ]
    }).send()

    const distanceMeters = res.body.routes[0].distance
    return distanceMeters/1000

}
/*
  🔮 FUTURE (GOOGLE PLACES / MAPS)
  --------------------------------
  Later this function can be replaced by:
  - Google Directions API
  - Google Distance Matrix API
  - Google Places API (for transit + POIs)

  Only this file will change.
  Controller & filtering logic remain SAME.
*/
module.exports = {getDistance}