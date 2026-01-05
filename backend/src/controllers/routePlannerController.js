const ROUTE_TEMPLATES = require("../data/routeTemplates")
const { getRouteMetrics } = require("../services/mapService")
const { isTemplateValid } = require("../utils/routeFilters")
const { findTransitHubs } = require("../services/transitHubService")
const { enrichRoute } = require("../services/routeEnrichmentService")

const extractCity = (address) => address ? address.split(',')[0].trim() : "Unknown City";

exports.planRoute = async (req, res) => {
  try {
    const { from, to } = req.body
    console.log("Received Route Request:", { from, to })

    if (!from || !from.lat || !from.lng || !to || !to.lat || !to.lng) {
      return res.status(400).json({ message: "Invalid Source or Destination coordinates" });
    }

    const globalMetrics = await getRouteMetrics(from, to, 'DRIVE')
    const distanceKm = globalMetrics.distanceKm

    const rawTemplates = ROUTE_TEMPLATES.filter((template) =>
      isTemplateValid(template, distanceKm)
    )

    const hubs = await findTransitHubs(from, to)
    const fromCity = extractCity(from.name)
    const toCity = extractCity(to.name)

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

    console.log(`Valid Routes: ${validRoutes.length}/${rawTemplates.length}`)

    const metricsCache = new Map() // Cache for this request
    const enrichedRoutes = await Promise.all(
      validRoutes.map((modes, index) =>
        enrichRoute(modes, index, hubs, fromCity, toCity, from, to, metricsCache)
      )
    )

    enrichedRoutes.sort((a, b) => a.totalTime - b.totalTime)
    if (enrichedRoutes.length > 0) enrichedRoutes[0].tag = "Fastest"

    const cheapestList = [...enrichedRoutes].sort((a, b) => a.priceRange.min - b.priceRange.min)
    if (cheapestList.length > 0) {
      const cheapId = cheapestList[0].id
      const match = enrichedRoutes.find(r => r.id === cheapId)
      if (match && match.tag !== "Fastest") match.tag = "Cheapest"
    }

    enrichedRoutes.forEach((r, i) => {
      if (!r.tag) r.tag = i < 2 ? "Best" : "Alternative"
    })

    const finalRoutes = enrichedRoutes.slice(0, 5)
    res.status(200).json({
      distanceKm,
      totalOptions: finalRoutes.length,
      routes: finalRoutes,
    })

  } catch (err) {
    console.error("Route planning error:", err)
    res.status(500).json({ message: "Failed to plan routes" })
  }
}
