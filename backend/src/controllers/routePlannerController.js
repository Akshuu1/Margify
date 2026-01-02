const ROUTE_TEMPLATES = require("../data/routeTemplates")
const { getDistance, findNearestPOI, getPlaceName } = require("../services/mapService")
const { isTemplateValid } = require("../utils/routeFilters")

const extractCity = (address) => {
  if (!address) return "Unknown City"
  return address.split(',')[0].trim()
}

const formatStopName = (mode, cityName, poiName) => {
  if (poiName) return poiName
  switch (mode) {
    case 'PLANE': return `${cityName} Airport`
    case 'BUS': return `${cityName} Bus Station`
    case 'TRAIN': return `${cityName} Railway Station`
    case 'METRO': return `${cityName} Metro Station`
    default: return `${cityName} Stop`
  }
}

const SPEEDS = {
  WALK: 5,
  AUTO: 30,
  BIKE: 40,
  CAB: 50,
  BUS: 40,
  METRO: 55,
  TRAIN: 80,
  PLANE: 600
}
const RATES = {
  WALK: 0,
  AUTO: 12,
  BIKE: 6,
  CAB: 18,
  BUS: 3,
  METRO: 4,
  TRAIN: 2,
  PLANE: 100
}

const BASE_FARES = {
  WALK: 0,
  AUTO: 30,
  BIKE: 20,
  CAB: 60,
  BUS: 10,
  METRO: 20,
  TRAIN: 50,
  PLANE: 3000
}

exports.planRoute = async (req, res) => {
  try {
    const { from, to } = req.body
    console.log("Received Route Request:", { from, to })

    const distanceKm = await getDistance(from, to)
    const rawTemplates = ROUTE_TEMPLATES.filter((template) =>
      isTemplateValid(template, distanceKm)
    )

    const fromCity = extractCity(from.name)
    const toCity = extractCity(to.name)

    // Find real transit hubs near start and end
    const [fromHubs, toHubs] = await Promise.all([
      Promise.all([
        findNearestPOI(from, "airport", 100).catch(() => null),
        findNearestPOI(from, "railway station", 40).catch(() => null), // Increased to 40km
        findNearestPOI(from, "metro", 25).catch(() => null), // Simplified query
        findNearestPOI(from, "bus stand", 30).catch(() => null),
      ]),
      Promise.all([
        findNearestPOI(to, "airport", 100).catch(() => null),
        findNearestPOI(to, "railway station", 40).catch(() => null),
        findNearestPOI(to, "metro", 25).catch(() => null),
        findNearestPOI(to, "bus stand", 30).catch(() => null),
      ])
    ])

    const hubs = {
      from: { PLANE: fromHubs[0], TRAIN: fromHubs[1], METRO: fromHubs[2], BUS: fromHubs[3] },
      to: { PLANE: toHubs[0], TRAIN: toHubs[1], METRO: toHubs[2], BUS: toHubs[3] }
    }

    console.log("Transit Hubs Found:", {
      from: Object.keys(hubs.from).filter(k => hubs.from[k]).map(k => `${k}: ${hubs.from[k].name}`),
      to: Object.keys(hubs.to).filter(k => hubs.to[k]).map(k => `${k}: ${hubs.to[k].name}`)
    })

    // Filter templates based on real transit availability
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

    const enrichedRoutes = await Promise.all(validRoutes.map(async (modes, index) => {
      let totalTimeMin = 0
      let totalCost = 0
      const segments = []
      let currentLocation = fromCity

      const segmentDistances = []
      const transitModes = ['PLANE', 'TRAIN', 'BUS', 'METRO']
      const transitIndices = modes.map((m, i) => transitModes.includes(m) ? i : -1).filter(i => i !== -1)

      if (transitIndices.length > 0 && modes.length > 1) {
        let totalTransferDist = 0
        modes.forEach((mode, i) => {
          if (!transitModes.includes(mode)) {
            const tDist = Math.min(distanceKm * 0.05, 15)
            segmentDistances[i] = tDist
            totalTransferDist += tDist
          }
        })
        const remainingDist = Math.max(distanceKm - totalTransferDist, 1)
        const distPerTransit = remainingDist / transitIndices.length
        transitIndices.forEach(idx => segmentDistances[idx] = distPerTransit)
      } else {
        const distPerLeg = distanceKm / modes.length
        modes.forEach(() => segmentDistances.push(distPerLeg))
      }

      modes.forEach((mode, i) => {
        const speed = SPEEDS[mode] || 30
        const rate = RATES[mode] || 10
        const base = BASE_FARES[mode] || 0
        const segmentDist = segmentDistances[i]

        const time = Math.round((segmentDist / speed) * 60)
        const cost = Math.round((segmentDist * rate) + base)

        totalTimeMin += time
        totalCost += cost

        let nextLocation = toCity
        if (i < modes.length - 1) {
          const nextMode = modes[i + 1]
          if (transitModes.includes(nextMode)) {
            nextLocation = hubs.from[nextMode]?.name || formatStopName(nextMode, fromCity)
          } else if (transitModes.includes(mode)) {
            nextLocation = hubs.to[mode]?.name || formatStopName(mode, toCity)
          } else {
            nextLocation = formatStopName(nextMode, i === 0 ? fromCity : toCity)
          }
        }

        segments.push({
          mode,
          from: currentLocation,
          to: nextLocation,
          duration: time,
          cost: cost,
          distance: segmentDist.toFixed(1)
        })
        currentLocation = nextLocation
      })
      if (modes.length > 1) {
        totalTimeMin += (modes.length - 1) * 20
        if (modes.includes('PLANE')) totalTimeMin += 90
      }
      const priceMin = Math.round(totalCost * 0.9)
      const priceMax = Math.round(totalCost * 1.1)

      let tag = null
      if (modes.includes('CAB') || modes.includes('PLANE')) tag = "Luxury"
      else if (modes.includes('METRO')) tag = "Best"
      if (index === 0) tag = "Best"

      return {
        id: index + 1,
        modes,
        segments,
        totalTime: Math.round(totalTimeMin),
        priceRange: { min: priceMin, max: priceMax },
        tag,
        transfers: modes.length - 1
      }
    }))
    enrichedRoutes.sort((a, b) => a.totalTime - b.totalTime)
    if (enrichedRoutes.length > 0) enrichedRoutes[0].tag = "Fastest"

    const cheapestList = [...enrichedRoutes].sort((a, b) => a.priceRange.min - b.priceRange.min)
    if (cheapestList.length > 0) {
      const cheapId = cheapestList[0].id
      const match = enrichedRoutes.find(r => r.id === cheapId)
      if (match && match.tag !== "Fastest") match.tag = "Cheapest"
    }
    enrichedRoutes.forEach((r, i) => {
      if (!r.tag) {
        r.tag = i < 2 ? "Best" : "Alternative"
      }
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
