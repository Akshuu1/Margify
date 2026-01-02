const express = require('express');
const router = express.Router();

router.get('/search', async (req, res) => {
    const query = req.query.query;

    if (!query) {
        return res.status(400).json({ error: "Query required" });
    }

    try {
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.formattedAddress'
            },
            body: JSON.stringify({
                textQuery: query
            })
        });

        const data = await response.json();

        if (!data.places) {
            return res.json([]);
        }

        const results = data.places.slice(0, 5).map(place => ({
            id: place.id,
            name: place.formattedAddress || place.displayName.text,
            lat: place.location.latitude,
            lng: place.location.longitude
        }));

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
