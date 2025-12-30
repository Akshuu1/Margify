const MODE_CONFIG = {
  WALK: {
    speed: 5,
    costPerKm: 0,
    variance: 0, 
  },
  AUTO: {
    speed: 25,
    costPerKm: 8,
    variance: 0.15, 
  },
  BIKE: {
    speed: 30,
    costPerKm: 4,
    variance: 0.1,
  },
  CAB: {
    speed: 35,
    costPerKm: 12,
    baseFare: 40,
    variance: 0.25, 
  },
  BUS: {
    speed: 40,
    costPerKm: 2,
    variance: 0.05,
  },
  TRAIN: {
    speed: 70,
    costPerKm: 1.5,
    variance: 0.1,
  },
  PLANE: {
    speed: 600,
    costPerKm: 6,
    baseFare: 1500,
    variance: 0.3, 
  },
};

module.exports = MODE_CONFIG;
