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
    console.log("📍 Hubs found:", {
      from: {
        PLANE: !!hubs.from.PLANE,
        TRAIN: !!hubs.from.TRAIN,
        METRO: !!hubs.from.METRO,
        BUS: !!hubs.from.BUS
      },
      to: {
        PLANE: !!hubs.to.PLANE,
        TRAIN: !!hubs.to.TRAIN,
        METRO: !!hubs.to.METRO,
        BUS: !!hubs.to.BUS
      }
    })

    const validRoutes = rawTemplates.filter(modes => {
      const transitModes = ['PLANE', 'TRAIN', 'METRO', 'BUS']
      for (let i = 0; i < modes.length; i++) {
        const mode = modes[i]
        if (transitModes.includes(mode)) {
          const isFirstHub = i === 0 || (i > 0 && !transitModes.includes(modes[i - 1]))
          const isLastHub = i === modes.length - 1 || (i < modes.length - 1 && !transitModes.includes(modes[i + 1]))
          
          // For METRO and BUS, allow routes even if hub is missing (calculate fallback)
          // Only strictly require PLANE and TRAIN hubs
          if (mode === 'PLANE' || mode === 'TRAIN') {
            if (isFirstHub && !hubs.from[mode]) {
              console.log(`⚠️  (Strict) Filtering out route with ${mode} at source`, modes)
              return false
            }
            if (isLastHub && !hubs.to[mode]) {
              console.log(`⚠️  (Strict) Filtering out route with ${mode} at destination`, modes)
              return false
            }
          } else {
            // METRO and BUS can work without hubs (will use fallback coordinates)
            if (isFirstHub && !hubs.from[mode]) {
              console.log(`ℹ️  ${mode} at source not found, will use fallback`, modes)
            }
            if (isLastHub && !hubs.to[mode]) {
              console.log(`ℹ️  ${mode} at destination not found, will use fallback`, modes)
            }
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

    // Filter out routes that failed to calculate correctly
    let finalRoutes = enrichedRoutes.filter(r => r.totalTime > 0);

    // FALLBACK: If no routes found, include basic non-transit routes
    if (finalRoutes.length === 0) {
      console.log("⚠️  No routes found after filtering, including fallback routes")
      const fallbackModes = [["WALK"], ["AUTO"], ["BIKE"], ["CAB"], ["BUS"], ["WALK", "BUS", "WALK"]]
      const fallbackRoutes = await Promise.all(
        fallbackModes.map((modes, index) =>
          enrichRoute(modes, index, hubs, from.name, to.name, from, to, metricsCache)
        )
      )
      finalRoutes = fallbackRoutes.filter(r => r.totalTime > 0)
    }

    // Sort by Time primarily
    finalRoutes.sort((a, b) => a.totalTime - b.totalTime);

    // TAGGING LOGIC
    if (finalRoutes.length > 0) {
      // 1. Fastest
      finalRoutes[0].tag = "Fastest";

      // 2. Economy (Cheapest)
      const cheapest = [...finalRoutes].sort((a, b) => a.priceRange.min - b.priceRange.min)[0];
      if (cheapest && cheapest.id !== finalRoutes[0].id) {
        const match = finalRoutes.find(r => r.id === cheapest.id);
        if (match) match.tag = "Economy";
      }

      // 3. Premium (CAB/PLANE focus)
      finalRoutes.forEach(r => {
        if (r.tag) return;
        if (r.modes.includes('CAB') || r.modes.includes('PLANE')) {
          r.tag = "Premium";
        }
      });

      // 4. Smart Choice (METRO focus - logical multi-modal)
      finalRoutes.forEach(r => {
        if (r.tag) return;
        if (r.modes.includes('METRO')) {
          r.tag = "Smart Choice";
        }
      });
    }

    // SORT ROUTES BY PRIORITY: Smart Choice > Economy > Premium > Fastest > Others
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
      // Fetch weather data
      const sourceWeather = await getWeatherForLocation(from.lat, from.lng).catch(() => null);
      const destWeather = await getWeatherForLocation(to.lat, to.lng).catch(() => null);
      if (sourceWeather && destWeather) {
        weatherData = { 
          source: { current: sourceWeather, location: from.name }, 
          destination: { current: destWeather, location: to.name }
        };
      }

      // Fetch tourist places from midpoint
      const midpointLat = (from.lat + to.lat) / 2;
      const midpointLng = (from.lng + to.lng) / 2;
      touristPlaces = await getNearbyTouristPlaces(midpointLat, midpointLng, 15000).catch(() => []);

      // Fetch food hubs near source and destination
      const fromFood = await getNearbyAmenities(from.lat, from.lng, 2000).catch(() => []);
      const toFood = await getNearbyAmenities(to.lat, to.lng, 2000).catch(() => []);

      // Build hubPitStops with food data
      if (fromFood.length > 0) hubPitStops.from.FOOD = fromFood;
      if (toFood.length > 0) hubPitStops.to.FOOD = toFood;

      // Also add transit hub food data if available
      if (hubs.from.METRO) hubPitStops.from.METRO = [hubs.from.METRO];
      if (hubs.from.TRAIN) hubPitStops.from.TRAIN = [hubs.from.TRAIN];
      if (hubs.from.BUS) hubPitStops.from.BUS = [hubs.from.BUS];
      if (hubs.to.METRO) hubPitStops.to.METRO = [hubs.to.METRO];
      if (hubs.to.TRAIN) hubPitStops.to.TRAIN = [hubs.to.TRAIN];
      if (hubs.to.BUS) hubPitStops.to.BUS = [hubs.to.BUS];

    } catch (e) {
      console.error("Error fetching additional data:", e.message);
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
    console.error("Route planning error:", err)
    res.status(500).json({ message: "Failed to plan routes" })
  }
}
