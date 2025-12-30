const MODE_CONFIG = require("../data/modeConfig");

function calculateCostAndTime (modes,distanceKm){
    let basePrice = 0
    let totalTime = 0

    let segments = []

    if (modes.length === 1){
        segments = [distanceKm]
    } else if (modes.length === 2){
        segments = [distanceKm * 0.3 , distanceKm * 0.7]
    } else{
        segments = [distanceKm * 0.1, distanceKm * 0.8 , distanceKm * 0.1]
    }

    for (let i = 0;i<modes.length;i++){
        const mode = modes[i]
        const config = MODE_CONFIG[mode]
        const segmentDistance = segments[i]

        totalTime += (segmentDistance/config.speed) * 60
        basePrice += segmentDistance * config.costPerKm

        if (config.baseFare && i === 0){
            basePrice += config.baseFare
        }

        const distanceRatio = segmentDistance / distanceKm;
        totalVariance += distanceRatio * (config.variance || 0)
    }

    const minPrice = Math.round(basePrice * (1-totalVariance))
    const maxPrice = Math.round(basePrice * (1+totalVariance))

    return {
        priceRange :{
            min:minPrice,
            max:maxPrice
        },
        totalTime : Math.round(totalTime)
    }

}

module.exports = {calculateCostAndTime}