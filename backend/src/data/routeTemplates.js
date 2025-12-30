const ROUTE_TEMPLATES = [
  ["WALK"],
  ["AUTO"],
  ["BIKE"],
  ["CAB"],
  ["BUS"],
  ["WALK", "BUS", "WALK"],
  ["AUTO", "BUS", "AUTO"],
  ["AUTO", "METRO", "WALK"],
  ["BIKE", "METRO", "AUTO"],
  ["AUTO", "TRAIN", "AUTO"],
  ["CAB", "TRAIN", "CAB"],
  ["AUTO", "TRAIN", "WALK"],
  ["BIKE", "TRAIN", "AUTO"],
  ["AUTO", "PLANE", "AUTO"],
  ["CAB", "PLANE", "CAB"],
];

module.exports = ROUTE_TEMPLATES;
