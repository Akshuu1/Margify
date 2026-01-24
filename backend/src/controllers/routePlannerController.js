const ROUTE_TEMPLATES = require("../data/routeTemplates")
const { getRouteMetrics, findNearestPOI } = require("../services/mapService")
const { isTemplateValid } = require("../utils/routeFilters")
const { findTransitHubs } = require("../services/transitHubService")
const { enrichRoute } = require("../services/routeEnrichmentService")
const { getWeatherForLocation, adjustRoutesForWeather } = require("../services/weatherService")
// Carbon features removed as per user request
// const { addEmissionsToRoutes, getEcoFriendlyRoute } = require("../services/carbonService")
const { getNearbyTouristPlaces } = require("../services/touristPlacesService")

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
    console.log("Global Metrics:", globalMetrics);

    const rawTemplates = ROUTE_TEMPLATES.filter((template) =>
      isTemplateValid(template, distanceKm)
    )
    console.log(`Templates after validation: ${rawTemplates.length}/${ROUTE_TEMPLATES.length}`);

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


    // 1. Identify Major Hubs for Long Distance (Fix for Sonipat -> Mussoorie)
    if (distanceKm > 150) {
      console.log(`Inter-city journey (${distanceKm.toFixed(1)}km). Checking for major transit terminals...`);

      // Try searching for ISBT specifically
      let majorBusHub = await findNearestPOI(from, "Interstate Bus Terminal", 60);
      if (!majorBusHub) majorBusHub = await findNearestPOI(from, "ISBT", 60);

      // If we are near Delhi (like Sonipat), explicitly look for Kashmiri Gate if generic ones fail
      if (!majorBusHub && distanceKm > 200) {
        majorBusHub = await findNearestPOI(from, "Maharana Pratap ISBT Kashmiri Gate", 70);
      }

      if (majorBusHub) {
        const currentHubName = hubs.from.BUS?.name || "none";
        if (majorBusHub.name !== currentHubName) {
          console.log(`Major Terminal Found: "${majorBusHub.name}" (Replacing local stand: "${currentHubName}")`);
          hubs.from.BUS = majorBusHub;
        }
      }
    }

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

    // Get weather data for BOTH source and destination
    let weatherData = null
    try {
      const sourceWeather = await getWeatherForLocation(from.lat, from.lng)
      const destWeather = await getWeatherForLocation(to.lat, to.lng)

      // Structure weather data properly for frontend
      weatherData = {
        source: {
          current: sourceWeather,
          location: from.name || 'Source',
          impact: 'low',
          message: 'Weather conditions are good for travel'
        },
        destination: {
          current: destWeather,
          location: to.name || 'Destination',
          impact: 'low',
          message: 'Weather conditions are good'
        }
      }
    } catch (error) {
      console.error("Weather fetch error:", error)
    }

    // 2. Add basic tags to routes
    enrichedRoutes.forEach((r, i) => {
      if (!r.tag) r.tag = i < 2 ? "Best" : "Alternative"
    })

    // Apply weather impact adjustments if needed
    let processedRoutes = enrichedRoutes;
    if (weatherData && weatherData.source && weatherData.source.current) {
      processedRoutes = adjustRoutesForWeather(enrichedRoutes, weatherData.source.current)
      // Update weather impact based on route adjustments
      const hasHighImpact = processedRoutes.some(r => r.weather && r.weather.impact === 'high')
      if (hasHighImpact) {
        weatherData.source.impact = 'high'
        weatherData.source.message = processedRoutes[0].weather?.message || 'Weather may affect some routes'
      }
    }


    // 2. ALWAYS fetch tourist places near destination
    let touristPlaces = [];
    try {
      touristPlaces = await require("../services/touristPlacesService").getNearbyTouristPlaces(to.lat, to.lng, 15000);
    } catch (error) {
      console.error('Error fetching tourist places:', error);
    }

    // 3. Hub Pit-Stops: Fetch amenities near transit hubs
    const hubAmenities = { from: {}, to: {} };
    try {
      const { getNearbyAmenities } = require("../services/touristPlacesService");

      const fetchHubAmenities = async (hubObj, type) => {
        const hubList = hubObj[type];
        const amenities = {};
        for (const mode of ['PLANE', 'TRAIN', 'METRO', 'BUS']) {
          if (hubList[mode]) {
            amenities[mode] = await getNearbyAmenities(hubList[mode].coordinates.lat, hubList[mode].coordinates.lng, 1000);
          }
        }
        return amenities;
      };

      const [fromAmen, toAmen] = await Promise.all([
        fetchHubAmenities(hubs, 'from'),
        fetchHubAmenities(hubs, 'to')
      ]);

      hubAmenities.from = fromAmen;
      hubAmenities.to = toAmen;
      console.log("Fetched pit-stops for transit hubs");
    } catch (error) {
      console.error("Error fetching hub pit-stops:", error);
    }

    // Pass hubAmenities to entire response or enrich segments?
    // Let's attach them to the response for now, frontend will match by station name.

    const finalRoutes = processedRoutes.slice(0, 5);
    res.status(200).json({
      distanceKm,
      totalOptions: processedRoutes.length,
      routes: finalRoutes,
      weather: weatherData,
      touristPlaces: touristPlaces,
      hubPitStops: hubAmenities,
      alerts: touristPlaces.length === 0 ? [{ message: 'No major tourist attractions found along this route' }] : []
    })

  } catch (err) {
    console.error("Route planning error:", err)
    res.status(500).json({ message: "Failed to plan routes" })
  }
}
