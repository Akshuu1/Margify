const mongoose = require('mongoose');

const SavedRouteSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        routeName: {
            type: String,
            required: true,
            trim: true
        },
        source: {
            address: { type: String, required: true },
            coordinates: {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true }
            }
        },
        destination: {
            address: { type: String, required: true },
            coordinates: {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true }
            }
        },
        preferences: {
            routeType: {
                type: String,
                enum: ['cheapest', 'fastest', 'eco', 'comfortable', 'vibe', 'luggage'],
                default: 'cheapest'
            },
            avoidModes: [String], // e.g., ['flight', 'auto']
            maxWalkingDistance: Number // in meters
        },
        specificRoute: {
            modes: [String],
            segments: [mongoose.Schema.Types.Mixed],
            totalTime: Number,
            priceRange: { min: Number, max: Number },
            tag: String,
            carbonEmissions: Number
        },
        lastUsed: {
            type: Date,
            default: Date.now
        },
        usageCount: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// Index for faster queries
SavedRouteSchema.index({ userId: 1, createdAt: -1 });

// Update lastUsed when route is accessed
SavedRouteSchema.methods.recordUsage = function () {
    this.lastUsed = Date.now();
    this.usageCount += 1;
    return this.save();
};

module.exports = mongoose.model('SavedRoute', SavedRouteSchema);
