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

    const validRoutes = rawTemplates.filter(modes => {
      const transitModes = ['PLANE', 'TRAIN', 'METRO', 'BUS']
      for (let i = 0; i < modes.length; i++) {
        const mode = modes[i]
        if (transitModes.includes(mode)) {
          const isFirstHub = i === 0 || (i > 0 && !transitModes.includes(modes[i - 1]))
          const isLastHub = i === modes.length - 1 || (i < modes.length - 1 && !transitModes.includes(modes[i + 1]))
          if (isFirstHub && !hubs.from[mode]) return false
          if (isLastHub && !hubs.to[mode]) return false
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
    const finalRoutes = enrichedRoutes.filter(r => r.totalTime > 0);

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
      routes: finalRoutes, // NO LIMITS
      weather: weatherData
    })
  } catch (err) {
    console.error("Route planning error:", err)
    res.status(500).json({ message: "Failed to plan routes" })
  }
}
