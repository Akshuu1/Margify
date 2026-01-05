const { getRouteMetrics } = require("./mapService");
const RATES = { WALK: 0, AUTO: 12, BIKE: 6, CAB: 18, BUS: 3, METRO: 4, TRAIN: 2, PLANE: 100 };
const BASE_FARES = { WALK: 0, AUTO: 30, BIKE: 20, CAB: 60, BUS: 10, METRO: 20, TRAIN: 50, PLANE: 3000 };

const formatStopName = (mode, cityName, poiName) => {
    if (poiName) return poiName;
    return `${cityName} ${mode.charAt(0) + mode.slice(1).toLowerCase()} Stop`;
};

async function enrichRoute(modes, index, hubs, fromCity, toCity, fromLoc, toLoc, metricsCache = new Map()) {
    let totalTimeMin = 0;
    let totalCost = 0;
    let currentLocation = fromCity;
    let lastCoords = fromLoc;
    const transitModes = ['PLANE', 'TRAIN', 'BUS', 'METRO'];
    const segments = [];
    for (let i = 0; i < modes.length; i++) {
        const mode = modes[i];
        let nextLocationName = toCity;
        let nextCoords = toLoc;
        let lineInfo = null;

        if (i < modes.length - 1) {
            const nextMode = modes[i + 1];

            if (transitModes.includes(nextMode)) {
                const hub = hubs.from[nextMode];
                if (hub) {
                    nextLocationName = hub.name;
                    nextCoords = { lat: hub.coordinates.lat, lng: hub.coordinates.lng };
                    lineInfo = { lineName: hub.lineName, lineColor: hub.lineColor, stationCode: hub.stationCode };
                }
            }
            else if (transitModes.includes(mode)) {
                const hub = hubs.to[mode];
                if (hub) {
                    nextLocationName = hub.name;
                    nextCoords = { lat: hub.coordinates.lat, lng: hub.coordinates.lng };
                    lineInfo = { lineName: hub.lineName, lineColor: hub.lineColor, stationCode: hub.stationCode };
                }
            }
            else {
                nextLocationName = formatStopName(nextMode, i === 0 ? fromCity : toCity);
            }
        }

        const cacheKey = `${lastCoords.lat},${lastCoords.lng}-${nextCoords.lat},${nextCoords.lng}-${mode}`;
        let metrics;
        if (metricsCache.has(cacheKey)) {
            metrics = await metricsCache.get(cacheKey); // Await the promise
        } else {
            const metricsPromise = getRouteMetrics(lastCoords, nextCoords, mode);
            metricsCache.set(cacheKey, metricsPromise);
            metrics = await metricsPromise;
        }

        const rate = RATES[mode] || 10;
        const base = BASE_FARES[mode] || 0;
        const cost = Math.round((metrics.distanceKm * rate) + base);

        totalTimeMin += metrics.durationMin;
        totalCost += cost;

        const segment = {
            mode,
            from: currentLocation,
            to: nextLocationName,
            duration: metrics.durationMin,
            cost: cost,
            distance: metrics.distanceKm.toFixed(1)
        };

        if (lineInfo) {
            segment.lineName = lineInfo.lineName;
            segment.lineColor = lineInfo.lineColor;
            segment.stationCode = lineInfo.stationCode;
        }

        segments.push(segment);

        currentLocation = nextLocationName;
        lastCoords = nextCoords;
    }

    if (modes.length > 1) {
        totalTimeMin += (modes.length - 1) * 20;
        if (modes.includes('PLANE')) totalTimeMin += 90;
    }

    const priceMin = Math.round(totalCost * 0.9);
    const priceMax = Math.round(totalCost * 1.1);

    let tag = null;
    if (modes.includes('CAB') || modes.includes('PLANE')) tag = "Luxury";
    else if (modes.includes('METRO')) tag = "Best";
    if (index === 0) tag = "Best";

    return {
        id: index + 1,
        modes,
        segments,
        totalTime: Math.round(totalTimeMin),
        priceRange: { min: priceMin, max: priceMax },
        tag,
        transfers: modes.length - 1
    };
}

module.exports = { enrichRoute };
