const ROUTE_TEMPLATES = require("../data/routeTemplates")
const { getRouteMetrics } = require("../services/mapService")
const { isTemplateValid } = require("../utils/routeFilters")
const { findTransitHubs } = require("../services/transitHubService")
const { enrichRoute } = require("../services/routeEnrichmentService")
const { getWeatherForLocation } = require("../services/weatherService")
const { getNearbyTouristPlaces, getNearbyAmenities } = require("../services/touristPlacesService")

exports.planRoute = async (req, res) => {
  try {
    const { from, to } = req.body
    if (!from || !from.lat || !from.lng || !to || !to.lat || !to.lng) {
      return res.status(400).json({ message: "Invalid Source or Destination coordinates" });
    }

    const globalMetrics = await getRouteMetrics(from, to, 'DRIVE')
    const distanceKm = globalMetrics.distanceKm

    const rawTemplates = ROUTE_TEMPLATES.filter((template) =>
      isTemplateValid(template, distanceKm)
    )

    const hubs = await findTransitHubs(from, to)

    const validRoutes = rawTemplates.filter(modes => {
      const transitModes = ['PLANE', 'TRAIN', 'METRO', 'BUS']
      for (let i = 0; i < modes.length; i++) {
        const mode = modes[i]
        if (transitModes.includes(mode)) {
          const isFirstHub = i === 0 || (i > 0 && !transitModes.includes(modes[i - 1]))
          const isLastHub = i === modes.length - 1 || (i < modes.length - 1 && !transitModes.includes(modes[i + 1]))

          if (mode === 'PLANE' || mode === 'TRAIN') {
            if (isFirstHub && !hubs.from[mode]) return false
            if (isLastHub && !hubs.to[mode]) return false
          }
        }
      }
      return true
    })

    const metricsCache = new Map()
    const enrichedRoutes = await Promise.all(
      validRoutes.map((modes, index) =>
        enrichRoute(modes, index, hubs, from.name, to.name, from, to, metricsCache)
      )
    )

    let finalRoutes = enrichedRoutes.filter(r => r.totalTime > 0);

    if (finalRoutes.length === 0) {
      const fallbackModes = [["WALK"], ["AUTO"], ["BIKE"], ["CAB"], ["BUS"], ["WALK", "BUS", "WALK"]]
      const fallbackRoutes = await Promise.all(
        fallbackModes.map((modes, index) =>
          enrichRoute(modes, index, hubs, from.name, to.name, from, to, metricsCache)
        )
      )
      finalRoutes = fallbackRoutes.filter(r => r.totalTime > 0)
    }

    finalRoutes = finalRoutes.filter(route => {
      if (distanceKm > 2 && route.modes.some(mode => mode === 'WALK')) {
        return route.modes.length > 1;
      }
      if (distanceKm > 20 && route.modes.some(mode => mode === 'AUTO')) {
        return false;
      }
      if (distanceKm > 30 && route.modes.some(mode => mode === 'BIKE')) {
        return false;
      }
      return true;
    });

    finalRoutes.sort((a, b) => a.totalTime - b.totalTime);

    if (finalRoutes.length > 0) {
      // --- CLEAN SINGLE-PASS TAGGING ---
      // Step 1: Find the best values
      const minTime = Math.min(...finalRoutes.map(r => r.totalTime));
      const maxTime = Math.max(...finalRoutes.map(r => r.totalTime));
      const minPrice = Math.min(...finalRoutes.map(r => r.priceRange.min));
      const maxPrice = Math.max(...finalRoutes.map(r => r.priceRange.max));

      // Step 2: Score every route. Lower = better.
      let bestScoreId = null;
      let bestScore = Infinity;

      finalRoutes.forEach(r => {
        // Normalize time and price to 0-1 range
        const timeNorm = maxTime > minTime ? (r.totalTime - minTime) / (maxTime - minTime) : 0;
        const priceNorm = maxPrice > minPrice ? (r.priceRange.min - minPrice) / (maxPrice - minPrice) : 0;

        // Combined score: 50% time, 50% price, with transfer penalty
        r._score = (timeNorm * 0.5) + (priceNorm * 0.5) + (r.transfers * 0.05);

        // Metro/Train get a reliability bonus (lower score = better)
        if (r.modes.includes('METRO') || r.modes.includes('TRAIN')) {
          r._score *= 0.85;
        }

        if (r._score < bestScore) {
          bestScore = r._score;
          bestScoreId = r.id;
        }
      });

      // Step 3: Assign tags — one pass, no conflicts
      const fastestId = finalRoutes[0].id; // already sorted by time
      const cheapestRoute = [...finalRoutes].sort((a, b) => a.priceRange.min - b.priceRange.min)[0];
      const cheapestId = cheapestRoute.id;

      finalRoutes.forEach(r => {
        const timeRatio = r.totalTime / minTime;
        const priceRatio = minPrice > 0 ? r.priceRange.min / minPrice : 1;

        // Not Recommended: must be BOTH slow AND expensive (not just one)
        if (timeRatio > 2.0 && priceRatio > 1.5) {
          r.tag = "Not Recommended";
          return;
        }

        if (r.id === bestScoreId) {
          r.tag = "Smart Choice";
        } else if (r.id === fastestId) {
          r.tag = "Fastest";
        } else if (r.id === cheapestId) {
          r.tag = "Economy";
        } else if (r.modes.includes('CAB') || r.modes.includes('PLANE')) {
          r.tag = "Premium";
        } else {
          // Give remaining routes a descriptive tag
          if (r.modes.includes('METRO') || r.modes.includes('TRAIN')) {
            r.tag = "Eco-Friendly";
          }
        }
      });

      // Clean up internal score
      finalRoutes.forEach(r => delete r._score);
    }

    const tagPriority = {
      "Smart Choice": 1,
      "Fastest": 2,
      "Economy": 3,
      "Premium": 4,
      "Not Recommended": 5
    };

    finalRoutes.sort((a, b) => {
      const priorityA = tagPriority[a.tag] || 99;
      const priorityB = tagPriority[b.tag] || 99;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return a.totalTime - b.totalTime;
    });

    let weatherData = null;
    let touristPlaces = [];
    let hubPitStops = { from: {}, to: {} };

    try {
      const sourceWeather = await getWeatherForLocation(from.lat, from.lng).catch(() => null);
      const destWeather = await getWeatherForLocation(to.lat, to.lng).catch(() => null);
      if (sourceWeather && destWeather) {
        weatherData = {
          source: { current: sourceWeather, location: from.name },
          destination: { current: destWeather, location: to.name }
        };
      }

      const midpointLat = (from.lat + to.lat) / 2;
      const midpointLng = (from.lng + to.lng) / 2;
      touristPlaces = await getNearbyTouristPlaces(midpointLat, midpointLng, 15000).catch(() => []);

      const fromFood = await getNearbyAmenities(from.lat, from.lng, 2000).catch(() => []);
      const toFood = await getNearbyAmenities(to.lat, to.lng, 2000).catch(() => []);

      if (fromFood.length > 0) hubPitStops.from.FOOD = fromFood;
      if (toFood.length > 0) hubPitStops.to.FOOD = toFood;

      if (hubs.from.METRO) hubPitStops.from.METRO = [hubs.from.METRO];
      if (hubs.from.TRAIN) hubPitStops.from.TRAIN = [hubs.from.TRAIN];
      if (hubs.from.BUS) hubPitStops.from.BUS = [hubs.from.BUS];
      if (hubs.to.METRO) hubPitStops.to.METRO = [hubs.to.METRO];
      if (hubs.to.TRAIN) hubPitStops.to.TRAIN = [hubs.to.TRAIN];
      if (hubs.to.BUS) hubPitStops.to.BUS = [hubs.to.BUS];

    } catch (e) {
    }

    res.status(200).json({
      distanceKm,
      totalOptions: finalRoutes.length,
      routes: finalRoutes.slice(0, 7),
      weather: weatherData,
      touristPlaces: touristPlaces,
      hubPitStops: hubPitStops,
      alerts: []
    })
  } catch (err) {
    res.status(500).json({ message: "Failed to plan routes" })
  }
}
