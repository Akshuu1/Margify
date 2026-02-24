const { getRouteMetrics } = require("./mapService");
const RATES = { WALK: 0, AUTO: 12, BIKE: 6, CAB: 22, BUS: 3, METRO: 3, TRAIN: 2, PLANE: 100 };
const BASE_FARES = { WALK: 0, AUTO: 30, BIKE: 20, CAB: 60, BUS: 10, METRO: 20, TRAIN: 50, PLANE: 3000 };

const formatStopName = (mode, cityName, poiName) => {
    if (poiName) return poiName;
    return `${cityName} ${mode.charAt(0) + mode.slice(1).toLowerCase()} Stop`;
};

function calculateHaversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

async function enrichRoute(modes, index, hubs, fromCity, toCity, fromLoc, toLoc, metricsCache = new Map()) {
    let totalTimeMin = 0;
    let totalCost = 0;
    let currentLocation = fromCity;
    let lastCoords = fromLoc;
    let totalWalkDistance = 0;
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
            metrics = await metricsCache.get(cacheKey);
        } else {
            const metricsPromise = getRouteMetrics(lastCoords, nextCoords, mode);
            metricsCache.set(cacheKey, metricsPromise);
            metrics = await metricsPromise;
        }

        if (mode === 'PLANE') {
            const aerialDist = calculateHaversine(lastCoords.lat, lastCoords.lng, nextCoords.lat, nextCoords.lng);
            metrics.distanceKm = aerialDist;
            metrics.durationMin = Math.round((aerialDist / 800) * 60) + 40;
        } else if (metrics.distanceKm === 0 || metrics.durationMin === 0) {
            const fallbackDist = calculateHaversine(lastCoords.lat, lastCoords.lng, nextCoords.lat, nextCoords.lng);
            metrics.distanceKm = fallbackDist;
            const speeds = { WALK: 5, BUS: 25, METRO: 35, TRAIN: 60, CAB: 35, AUTO: 25, BIKE: 15 };
            metrics.durationMin = Math.round((fallbackDist / (speeds[mode] || 30)) * 60);
        }

        const rate = RATES[mode] || 10;
        const base = BASE_FARES[mode] || 0;
        let cost = Math.round((metrics.distanceKm * rate) + base);

        if (metrics.fare && metrics.fare.amount) {
            cost = metrics.fare.amount;
        } else {
            if (mode === 'METRO') cost = Math.min(cost, 60);
            if (mode === 'BUS') cost = Math.min(cost, 50);
        }

        totalTimeMin += metrics.durationMin;
        totalCost += cost;
        if (mode === 'WALK') totalWalkDistance += metrics.distanceKm;

        const segment = {
            mode,
            from: currentLocation,
            to: nextLocationName,
            fromCoords: { lat: lastCoords.lat, lng: lastCoords.lng },
            toCoords: { lat: nextCoords.lat, lng: nextCoords.lng },
            duration: metrics.durationMin,
            cost: cost,
            distance: metrics.distanceKm.toFixed(1),
            polyline: metrics.polyline
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
        modes.forEach((mode, idx) => {
            if (idx === 0) return;
            const prevMode = modes[idx - 1];
            let transferTime = 10;
            if (mode === 'PLANE' || prevMode === 'PLANE') transferTime = 120;
            else if (mode === 'TRAIN' || prevMode === 'TRAIN') transferTime = 30;
            else if (mode === 'METRO' || mode === 'BUS') transferTime = 8;
            else if (mode === 'WALK' || prevMode === 'WALK') transferTime = 3;
            totalTimeMin += transferTime;
        });
    }

    const priceMin = Math.round(totalCost * 0.9);
    const priceMax = Math.round(totalCost * 1.1);

    return {
        id: index + 1,
        modes,
        segments,
        totalTime: Math.round(totalTimeMin),
        totalWalkDistance: parseFloat(totalWalkDistance.toFixed(2)),
        priceRange: { min: priceMin, max: priceMax },
        tag: null, // Tagging moved to controller
        transfers: modes.length - 1
    };
}

module.exports = { enrichRoute };
