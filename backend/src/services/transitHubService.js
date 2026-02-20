const { findNearestPOI } = require("./mapService");

async function findTransitHubs(from, to) {
  try {
    const [fromHubs, toHubs] = await Promise.all([
      Promise.all([
        findNearestPOI(from, "airport", 50).catch(() => null),
        findNearestPOI(from, "railway station", 50).catch(() => null),
        findNearestPOI(from, "metro station", 50).catch(() => null),
        findNearestPOI(from, "bus station", 50).catch(() => null),
      ]),
      Promise.all([
        findNearestPOI(to, "airport", 50).catch(() => null),
        findNearestPOI(to, "railway station", 50).catch(() => null),
        findNearestPOI(to, "metro station", 50).catch(() => null),
        findNearestPOI(to, "bus station", 50).catch(() => null),
      ])
    ]);

    return {
      from: { PLANE: fromHubs[0], TRAIN: fromHubs[1], METRO: fromHubs[2], BUS: fromHubs[3] },
      to: { PLANE: toHubs[0], TRAIN: toHubs[1], METRO: toHubs[2], BUS: toHubs[3] }
    };
  } catch (error) {
    return {
      from: { PLANE: null, TRAIN: null, METRO: null, BUS: null },
      to: { PLANE: null, TRAIN: null, METRO: null, BUS: null }
    };
  }
}

module.exports = { findTransitHubs };
