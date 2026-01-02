function extractTransitInfo(placeName, formattedAddress) {
    const info = {
        lineName: null,
        stationCode: null,
        lineColor: null
    };

    const linePatterns = [
        /\b(Red|Blue|Yellow|Green|Violet|Pink|Magenta|Grey|Orange|Aqua|Purple)\s+Line\b/i,
        /Metro\s+Line\s+(\d+)/i,
        /Line\s+(\d+)/i
    ];

    for (const pattern of linePatterns) {
        const match = placeName.match(pattern) || formattedAddress?.match(pattern);
        if (match) {
            info.lineName = match[0];
            const colorMap = {
                'red': '#FF0000',
                'blue': '#0000FF',
                'yellow': '#FFD700',
                'green': '#00FF00',
                'violet': '#8B00FF',
                'pink': '#FF69B4',
                'magenta': '#FF00FF',
                'grey': '#808080',
                'orange': '#FFA500',
                'aqua': '#00FFFF',
                'purple': '#800080'
            };
            const colorKey = match[1]?.toLowerCase();
            info.lineColor = colorMap[colorKey] || '#888888';
            break;
        }
    }

    const codeMatch = placeName.match(/\b([A-Z]{2,4})\b/);
    if (codeMatch) {
        info.stationCode = codeMatch[1];
    }

    return info;
}

module.exports = { extractTransitInfo };
