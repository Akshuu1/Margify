const { findNearestPOI } = require("./mapService");

async function findTransitHubs(from, to) {
    try {
        const [fromHubs, toHubs] = await Promise.all([
            Promise.all([
                findNearestPOI(from, "airport", 50).catch((e) => {
                    console.error("❌ Error finding airport at source:", e.message);
                    return null;
                }),
                findNearestPOI(from, "railway station", 50).catch((e) => {
                    console.error("❌ Error finding railway station at source:", e.message);
                    return null;
                }),
                findNearestPOI(from, "metro station", 50).catch((e) => {
                    console.error("❌ Error finding metro station at source:", e.message);
                    return null;
                }),
                findNearestPOI(from, "bus station", 50).catch((e) => {
                    console.error("❌ Error finding bus station at source:", e.message);
                    return null;
                }),
            ]),
            Promise.all([
                findNearestPOI(to, "airport", 50).catch((e) => {
                    console.error("❌ Error finding airport at destination:", e.message);
                    return null;
                }),
                findNearestPOI(to, "railway station", 50).catch((e) => {
                    console.error("❌ Error finding railway station at destination:", e.message);
                    return null;
                }),
                findNearestPOI(to, "metro station", 50).catch((e) => {
                    console.error("❌ Error finding metro station at destination:", e.message);
                    return null;
                }),
                findNearestPOI(to, "bus station", 50).catch((e) => {
                    console.error("❌ Error finding bus station at destination:", e.message);
                    return null;
                }),
            ])
        ]);

        const result = {
            from: { PLANE: fromHubs[0], TRAIN: fromHubs[1], METRO: fromHubs[2], BUS: fromHubs[3] },
            to: { PLANE: toHubs[0], TRAIN: toHubs[1], METRO: toHubs[2], BUS: toHubs[3] }
        };

        console.log("✅ Transit hubs found successfully");
        return result;
    } catch (error) {
        console.error("❌ Fatal error in findTransitHubs:", error.message);
        return {
            from: { PLANE: null, TRAIN: null, METRO: null, BUS: null },
            to: { PLANE: null, TRAIN: null, METRO: null, BUS: null }
        };
    }
}

module.exports = { findTransitHubs };
