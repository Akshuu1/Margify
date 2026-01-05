require('dotenv').config();
const { findTransitHubs } = require("./src/services/transitHubService");
const { getRouteMetrics } = require("./src/services/mapService");
const { enrichRoute } = require("./src/services/routeEnrichmentService");

const run = async () => {
    // Rishihood University (approx) - Strings to test coercion
    const from = { lat: "28.985", lng: "77.065", name: "Rishihood University" };
    // Noida (approx center)
    const to = { lat: "28.5355", lng: "77.3910", name: "Noida" };

    console.log("=== Debugging Route: Rishihood to Noida ===");

    // 1. Check Transit Hubs
    console.log("\n1. Finding Transit Hubs...");
    const hubs = await findTransitHubs(from, to);
    console.log("From Hubs:", JSON.stringify(hubs.from, null, 2));
    console.log("To Hubs:", JSON.stringify(hubs.to, null, 2));

    // 2. Check Route Metrics for CAB -> METRO -> CAB
    // Assuming modes: ["CAB", "METRO", "CAB"]
    const modes = ["CAB", "METRO", "CAB"];

    // Segment 1: Rishihood -> Nearest Metro (hubs.from.METRO)
    if (hubs.from.METRO) {
        console.log("\n2a. Segment 1: CAB (Rishihood -> Nearest Metro)");
        console.log(`Nearest Metro Name: ${hubs.from.METRO.name}`);
        const metrics1 = await getRouteMetrics(from, hubs.from.METRO.coordinates, 'CAB');
        console.log("Metrics 1:", metrics1);
    } else {
        console.log("\n2a. No Metro found near Start.");
    }
    // 3. Search for "Rishihood University" to see what comes up
    console.log("\n3. Searching for 'Rishihood University'...");
    const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
            'X-Goog-FieldMask': 'places.displayName,places.location,places.formattedAddress'
        },
        body: JSON.stringify({
            textQuery: "Rishihood University"
        })
    });
    const searchData = await searchRes.json();
    if (searchData.places) {
        searchData.places.forEach((p, i) => {
            console.log(`#${i + 1}: ${p.displayName.text}`);
            console.log(`   Addr: ${p.formattedAddress}`);
            console.log(`   Loc: ${p.location.latitude}, ${p.location.longitude}`);
        });
    } else {
        console.log("No places found.");
    }
};

run();
