const express = require('express')
const router = express.Router()
const { secure } = require('../middleware/middleware')
const { planRoute } = require('../controllers/routePlannerController')

router.post('/plan', secure, planRoute)
console.log("routePlannerRoutes loaded");


module.exports = routerx