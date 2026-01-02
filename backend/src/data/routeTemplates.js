const ROUTE_TEMPLATES = [
  // Short Distance / Local
  ["WALK"],
  ["AUTO"],
  ["BIKE"],
  ["CAB"],
  ["BUS"],
  ["WALK", "BUS", "WALK"],
  ["WALK", "METRO", "WALK"],
  ["AUTO", "BUS", "AUTO"],
  ["AUTO", "METRO", "AUTO"],
  ["WALK", "METRO", "AUTO"],
  ["AUTO", "METRO", "WALK"],
  ["CAB", "METRO", "CAB"],
  ["BIKE", "METRO", "BIKE"],

  // Medium Distance / City-to-City or Suburban
  ["AUTO", "TRAIN", "AUTO"],
  ["CAB", "TRAIN", "CAB"],
  ["WALK", "TRAIN", "WALK"],
  ["AUTO", "TRAIN", "WALK"],
  ["WALK", "TRAIN", "AUTO"],
  ["BIKE", "TRAIN", "BIKE"],
  ["BUS", "TRAIN", "BUS"],

  // Complex Urban Transit
  ["AUTO", "METRO", "BUS", "WALK"],
  ["WALK", "BUS", "METRO", "AUTO"],
  ["CAB", "METRO", "BUS", "CAB"],

  // Long Distance / National
  ["AUTO", "PLANE", "AUTO"],
  ["CAB", "PLANE", "CAB"],
  ["BUS", "PLANE", "BUS"],
  ["AUTO", "TRAIN", "TRAIN", "AUTO"], // Multi-leg train
  ["CAB", "PLANE", "TRAIN", "CAB"], // Flight + Train
];

module.exports = ROUTE_TEMPLATES;
