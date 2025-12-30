const ROUTE_TEMPLATES = require("../data/routeTemplates");
const { getDistance } = require("../services/mapService");
const { isTemplateValid } = require("../utils/routeFilters");


exports.planRoute = async (req, res) => {
  const { from, to } = req.body;

  const distanceKm = await getDistance(from,to)
  const validRoutes = ROUTE_TEMPLATES.filter(template => isTemplateValid(template,distanceKm))

  res.status(200).json({
    distanceKm,
    totalOptions:validRoutes.length,
    routes:validRoutes.map((modes,index) =>({
        id : index+1,
        modes
    }))
  });
};
