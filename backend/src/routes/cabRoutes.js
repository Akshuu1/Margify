const express = require('express');
const router = express.Router();
const { getCabPrices } = require('../services/cabPriceService');

/**
 * GET /api/cab/prices
 * 
 * Query params:
 *   fromLat, fromLng, toLat, toLng (required)
 *   distanceKm (optional — will be estimated if not provided)
 *   fromName, toName (optional — used in deep links)
 * 
 * Returns array of cab options with prices and booking links.
 */
router.get('/prices', (req, res) => {
    try {
        const { fromLat, fromLng, toLat, toLng, distanceKm, fromName, toName } = req.query;

        // Validate required params
        if (!fromLat || !fromLng || !toLat || !toLng) {
            return res.status(400).json({
                message: 'Missing required parameters: fromLat, fromLng, toLat, toLng'
            });
        }

        const from = { lat: parseFloat(fromLat), lng: parseFloat(fromLng) };
        const to = { lat: parseFloat(toLat), lng: parseFloat(toLng) };

        // Validate coordinates are valid numbers
        if (isNaN(from.lat) || isNaN(from.lng) || isNaN(to.lat) || isNaN(to.lng)) {
            return res.status(400).json({ message: 'Invalid coordinates — must be valid numbers' });
        }

        // Validate coordinate ranges
        if (Math.abs(from.lat) > 90 || Math.abs(to.lat) > 90 || Math.abs(from.lng) > 180 || Math.abs(to.lng) > 180) {
            return res.status(400).json({ message: 'Coordinates out of valid range' });
        }

        const dist = distanceKm ? parseFloat(distanceKm) : null;

        const prices = getCabPrices(
            from.lat, from.lng,
            to.lat, to.lng,
            dist,
            fromName || '',
            toName || ''
        );

        res.json({
            success: true,
            count: prices.length,
            prices,
            timestamp: new Date().toISOString(),
        });

    } catch (err) {
        console.error('Cab price estimation error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to estimate cab prices',
            prices: []
        });
    }
});

module.exports = router;
