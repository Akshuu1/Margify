const { findNearestPOI } = require("./mapService");

async function findTransitHubs(from, to) {
    const [fromHubs, toHubs] = await Promise.all([
        Promise.all([
            findNearestPOI(from, "airport", 100).catch(() => null),
            findNearestPOI(from, "railway station", 60).catch(() => null),
            findNearestPOI(from, "metro station", 50).catch(() => null),
            findNearestPOI(from, "bus station", 40).catch(() => null),
        ]),
        Promise.all([
            findNearestPOI(to, "airport", 100).catch(() => null),
            findNearestPOI(to, "railway station", 60).catch(() => null),
            findNearestPOI(to, "metro station", 50).catch(() => null),
            findNearestPOI(to, "bus station", 40).catch(() => null),
        ])
    ]);

    return {
        from: { PLANE: fromHubs[0], TRAIN: fromHubs[1], METRO: fromHubs[2], BUS: fromHubs[3] },
        to: { PLANE: toHubs[0], TRAIN: toHubs[1], METRO: toHubs[2], BUS: toHubs[3] }
    };
}

module.exports = { findTransitHubs };
