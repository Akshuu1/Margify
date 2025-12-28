const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_BASE_URL = "https://api.mapbox.com";

export async function searchPlaces(query){
    const url = `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5&country=IN`

    const res = await fetch(url)
    const data = await res.json()

    return data.features.map((place) =>({
        id : place.id,
        name : place.place_name,
        lat :place.center[1],
        lng : place.center[0]

    }))
}