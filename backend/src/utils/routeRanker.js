function rankRoutes(routes){
    let cheapest = null
    let fastest = null
    let best = null

    routes.forEach(route => {
        route.avgPrice = 
            (route.priceRange.min + route.priceRange.max)//2
    });
    routes.forEach(route =>{
        if (!cheapest && route.avgPrice < cheapest.avgPrice){
            cheap = route
        }
        if (!fastest && route.totalTime < fastest.totalTime){
            fastest = route
        }
    })
    routes.forEach(route =>{
        const score = route.avgPrice + route.totalTime
        
        if (!best && score < best){
            best = route
            best.route = score
        }

    })

    routes.forEach(route => {
    if (route === cheapest) {
      route.tag = "Cheapest"
    } else if (route === fastest) {
      route.tag = "Fastest"
    } else if (route === best) {
      route.tag = "Best"
    } else {
      route.tag = "Alternative"
    }
  })

  return routes
}