const ROUTE_TEMPLATES = require("../data/routeTemplates")
const { getRouteMetrics } = require("../services/mapService")
const { isTemplateValid } = require("../utils/routeFilters")
const { findTransitHubs } = require("../services/transitHubService")
const { enrichRoute } = require("../services/routeEnrichmentService")
const { getWeatherForLocation } = require("../services/weatherService")

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

    let weatherData = null;
    try {
      const sourceWeather = await getWeatherForLocation(from.lat, from.lng)
      const destWeather = await getWeatherForLocation(to.lat, to.lng)
      weatherData = { sourcePath: sourceWeather, destPath: destWeather };
    } catch (e) { }

    res.status(200).json({
      distanceKm,
      totalOptions: finalRoutes.length,
      routes: finalRoutes.slice(0,7), // NO LIMITS
      weather: weatherData
    })
  } catch (err) {
    console.error("Route planning error:", err)
    res.status(500).json({ message: "Failed to plan routes" })
  }
}
