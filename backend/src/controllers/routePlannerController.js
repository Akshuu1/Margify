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
      finalRoutes[0].tag = "Fastest";

      const cheapest = [...finalRoutes].sort((a, b) => a.priceRange.min - b.priceRange.min)[0];
      if (cheapest && cheapest.id !== finalRoutes[0].id) {
        const match = finalRoutes.find(r => r.id === cheapest.id);
        if (match) match.tag = "Economy";
      }

      finalRoutes.forEach(r => {
        if (r.tag) return;
        if (r.modes.includes('CAB') || r.modes.includes('PLANE')) {
          r.tag = "Premium";
        }
      });

      const timeValues = finalRoutes.map(r => r.totalTime);
      const priceValues = finalRoutes.map(r => r.priceRange.min);
      const minTime = Math.min(...timeValues);
      const maxTime = Math.max(...timeValues);
      const minPrice = Math.min(...priceValues);
      const maxPrice = Math.max(...priceValues);
      const timeRange = maxTime - minTime;
      const priceRange = maxPrice - minPrice;

      finalRoutes.forEach(r => {
        if (r.tag) return;
        if (!r.modes.includes('METRO')) return;

        const timeNorm = timeRange > 0 ? (r.totalTime - minTime) / timeRange : 0.5;
        const priceNorm = priceRange > 0 ? (r.priceRange.min - minPrice) / priceRange : 0.5;

        if (timeNorm >= 0.3 && timeNorm <= 0.7 && priceNorm >= 0.3 && priceNorm <= 0.7) {
          r.tag = "Smart Choice";
        }
      });
    }

    const tagPriority = {
      "Smart Choice": 1,
      "Economy": 2,
      "Premium": 3,
      "Fastest": 4
    };

    finalRoutes.sort((a, b) => {
      const priorityA = tagPriority[a.tag] || 99;
      const priorityB = tagPriority[b.tag] || 99;
      return priorityA - priorityB;
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
