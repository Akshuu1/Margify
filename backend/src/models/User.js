const mongoose = require('mongoose');

const User = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        carbonStats: {
            type: Object,
            default: { totalSaved: 0, badges: [] }
        },
        resetPasswordToken: String,
        resetPasswordExpires: Date
    },
    { timestamps: true }
)

module.exports = mongoose.model("Collection", User)