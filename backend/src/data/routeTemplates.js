const ROUTE_TEMPLATES = [
  // Short Distance / Local (always available - no transit hubs required)
  ["WALK"],
  ["AUTO"],
  ["BIKE"],
  ["CAB"],
  ["BUS"],
  
  // Local multi-modal (may vary by location)
  ["WALK", "BUS", "WALK"],
  ["WALK", "METRO", "WALK"],
  ["AUTO", "BUS", "AUTO"],
  ["AUTO", "METRO", "AUTO"],
  ["WALK", "METRO", "AUTO"],
  ["AUTO", "METRO", "WALK"],
  ["CAB", "METRO", "CAB"],
  ["BIKE", "METRO", "BIKE"],
  
  // Train routes (for longer distances)
  ["AUTO", "TRAIN", "AUTO"],
  ["CAB", "TRAIN", "CAB"],
  ["BUS", "TRAIN", "CAB"],
  ["CAB", "BUS", "CAB"],
  ["TRAIN", "BUS", "AUTO"],
  ["METRO", "BUS", "CAB"],
  ["AUTO", "TRAIN", "BUS"],
  ["CAB", "METRO", "AUTO"],
  ["WALK", "TRAIN", "WALK"],
  ["AUTO", "TRAIN", "WALK"],
  ["WALK", "TRAIN", "AUTO"],
  ["BIKE", "TRAIN", "BIKE"],
  
  // Complex routes
  ["AUTO", "METRO", "BUS", "WALK"],
  ["WALK", "BUS", "METRO", "AUTO"],
  
  // Flight routes
  ["AUTO", "PLANE", "AUTO"],
  ["CAB", "PLANE", "CAB"],
  ["BUS", "PLANE", "BUS"],
  ["AUTO", "TRAIN", "TRAIN", "AUTO"],
]

module.exports = ROUTE_TEMPLATES
