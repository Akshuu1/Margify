
const dotenv = require("dotenv");
dotenv.config({ path: "./backend/.env" }); // Assuming running from root, or just .env if in backend

const { getDistance } = require("./src/services/mapService");
const ROUTE_TEMPLATES = require("./src/data/routeTemplates");
const { isTemplateValid } = require("./src/utils/routeFilters");

async function runManualTest() {
    console.log("--- Manual Route Logic Test ---");

    // Hardcoded locations (Delhi example)
    const from = { lat: 28.7041, lng: 77.1025 }; // Delhi
    const to = { lat: 28.5355, lng: 77.3910 };   // Noida

    console.log(`From: ${JSON.stringify(from)}`);
    console.log(`To: ${JSON.stringify(to)}`);

    try {
        console.log("Fetching distance...");
        const distanceKm = await getDistance(from, to);
        console.log(`Distance: ${distanceKm} km`);

        console.log("Filtering templates...");
        const validRoutes = ROUTE_TEMPLATES.filter((template) =>
            isTemplateValid(template, distanceKm)
        );
        console.log(`Valid Templates Found: ${validRoutes.length}`);

        if (validRoutes.length === 0) {
            console.log("WARNING: No valid templates found for this distance.");
        }

        const enrichedRoutes = validRoutes.map((modes, index) => {
            const avgSpeed = 30; // km/h
            const timeHours = distanceKm / avgSpeed;
            const totalTimeMin = Math.round(timeHours * 60) + modes.length * 5;

            const basePrice = distanceKm * 10;
            const priceMin = Math.round(basePrice * 0.8);
            const priceMax = Math.round(basePrice * 1.2);

            let tag = null;
            if (index === 0) tag = "Fastest";
            else if (index === 1) tag = "Cheapest";
            else if (index === 3) tag = "Best";

            return {
                id: index + 1,
                modes,
                totalTime: totalTimeMin,
                priceRange: { min: priceMin, max: priceMax },
                tag,
            };
        });

        console.log("\n--- Generated Routes ---");
        enrichedRoutes.forEach(r => {
            console.log(`Route ${r.id}: [${r.modes.join(" -> ")}] | Time: ${r.totalTime} min | Price: ₹${r.priceRange.min}-${r.priceRange.max} | Tag: ${r.tag || 'None'}`);
        });

    } catch (err) {
        console.error("ERROR in manual test:", err);
    }
}

runManualTest();
