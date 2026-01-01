const ROUTE_TEMPLATES = require("../data/routeTemplates");
const { getDistance } = require("../services/mapService");
const { isTemplateValid } = require("../utils/routeFilters");

const SPEEDS = {
  WALK: 5,
  AUTO: 25,
  BIKE: 40,
  CAB: 30,
  BUS: 20,
  METRO: 45,
  TRAIN: 60,
  PLANE: 600
};
const RATES = {
  WALK: 0,
  AUTO: 12,
  BIKE: 6,
  CAB: 18,
  BUS: 3,
  METRO: 4,
  TRAIN: 2,
  PLANE: 100 // simplified
};

// Base fares (₹) to add once per mode usage
const BASE_FARES = {
  WALK: 0,
  AUTO: 30,
  BIKE: 20,
  CAB: 50,
  BUS: 10,
  METRO: 20,
  TRAIN: 50,
  PLANE: 3000
};

exports.planRoute = async (req, res) => {
  try {
    const { from, to } = req.body;
    console.log("Received Route Request:");
    console.log("From:", from);
    console.log("To:", to);

    const distanceKm = await getDistance(from, to);
    console.log("Calculated Distance (km):", distanceKm);
    const validRoutes = ROUTE_TEMPLATES.filter((template) =>
      isTemplateValid(template, distanceKm)
    );

    const enrichedRoutes = validRoutes.map((modes, index) => {
      let totalTimeMin = 0;
      let totalCost = 0;

      const segments = [];
      let currentLocation = "Source Location"; // Default start
      if (from.name) currentLocation = from.name.split(',')[0]; // Try to use short name

      // Distribute distance across modes roughly equal for now
      const segmentDist = distanceKm / modes.length;

      modes.forEach((mode, i) => {
        const speed = SPEEDS[mode] || 30;
        const rate = RATES[mode] || 10;
        const base = BASE_FARES[mode] || 0;

        // Time & Cost
        const time = Math.round((segmentDist / speed) * 60);
        const cost = Math.round((segmentDist * rate) + base);

        totalTimeMin += time;
        totalCost += cost;

        // Determine Next Location Name (Mocking)
        let nextLocation = "Destination";
        if (i < modes.length - 1) {
          const nextMode = modes[i + 1];
          if (nextMode === 'BUS') nextLocation = "Bus Stand";
          else if (nextMode === 'METRO') nextLocation = "Metro Station";
          else if (nextMode === 'TRAIN') nextLocation = "Railway Station";
          else if (nextMode === 'PLANE') nextLocation = "Airport";
          else nextLocation = "Stop " + (i + 1);
        } else {
          if (to.name) nextLocation = to.name.split(',')[0];
        }

        segments.push({
          mode,
          from: currentLocation,
          to: nextLocation,
          duration: time,
          cost: cost,
          distance: segmentDist.toFixed(1)
        });

        currentLocation = nextLocation;
      });

      // Add transfer time penalty (10 mins per transfer) to total ONLY? 
      // Or distribute it? Let's just add to total for now to keep segments clean.
      if (modes.length > 1) {
        totalTimeMin += (modes.length - 1) * 10;
      }

      const priceMin = Math.round(totalCost * 0.9);
      const priceMax = Math.round(totalCost * 1.1);

      let tag = null;
      if (modes.length === 1 && modes[0] === 'BIKE') tag = "Fastest";
      if (modes.includes('METRO')) tag = "Eco-Friendly";
      if (modes.includes('CAB')) tag = "Comfort";
      if (index === 0) tag = "Best";

      return {
        id: index + 1,
        modes, // Keep for backward compat if needed, simplified
        segments, // NEW: Detailed segments
        totalTime: Math.round(totalTimeMin),
        priceRange: { min: priceMin, max: priceMax },
        tag,
        transfers: modes.length - 1
      };
    });

    // Sort to actually find cheapest/fastest for tagging
    enrichedRoutes.sort((a, b) => a.totalTime - b.totalTime);
    if (enrichedRoutes.length > 0) enrichedRoutes[0].tag = "Fastest";

    const cheapest = [...enrichedRoutes].sort((a, b) => a.priceRange.min - b.priceRange.min);
    if (cheapest.length > 0) {
      // Find the object in original array and tag it
      const cheapId = cheapest[0].id;
      const match = enrichedRoutes.find(r => r.id === cheapId);
      if (match && match.tag !== "Fastest") match.tag = "Cheapest";
    }

    res.status(200).json({
      distanceKm,
      totalOptions: enrichedRoutes.length,
      routes: enrichedRoutes,
    });
  } catch (err) {
    console.error("Route planning error:", err);
    res.status(500).json({ message: "Failed to plan routes" });
  }
};
