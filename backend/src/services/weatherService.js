const axios = require('axios');

const BASE_URL = 'https://api.open-meteo.com/v1';

async function getWeatherForLocation(lat, lng) {
    try {
        const response = await axios.get(`${BASE_URL}/forecast`, {
            params: {
                latitude: lat,
                longitude: lng,
                current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
                wind_speed_unit: 'ms'
            }
        });

        const data = response.data.current;
        const weatherCondition = getWeatherCondition(data.weather_code);

        return {
            temperature: data.temperature_2m,
            feelsLike: data.temperature_2m,
            condition: weatherCondition.main,
            description: weatherCondition.description,
            humidity: data.relative_humidity_2m,
            windSpeed: data.wind_speed_10m,
            icon: '01d'
        };
    } catch (error) {
        return {
            temperature: 25,
            feelsLike: 25,
            condition: 'Clear',
            description: 'Clear sky',
            humidity: 50,
            windSpeed: 5,
            icon: '01d'
        };
    }
}

function getWeatherCondition(code) {
    if (code === 0) return { main: 'Clear', description: 'Clear sky' };
    if (code >= 1 && code <= 3) return { main: 'Clouds', description: 'Partly cloudy' };
    if (code >= 45 && code <= 48) return { main: 'Fog', description: 'Foggy' };
    if (code >= 51 && code <= 55) return { main: 'Drizzle', description: 'Light drizzle' };
    if (code >= 61 && code <= 67) return { main: 'Rain', description: 'Rain' };
    if (code >= 71 && code <= 77) return { main: 'Snow', description: 'Snow' };
    if (code >= 80 && code <= 82) return { main: 'Rain', description: 'Rain showers' };
    if (code >= 85 && code <= 86) return { main: 'Snow', description: 'Snow showers' };
    if (code >= 95 && code <= 99) return { main: 'Thunderstorm', description: 'Thunderstorm' };
    return { main: 'Clear', description: 'Clear sky' };
}

function adjustRoutesForWeather(routes, weather) {
    const weatherConditions = {
        Rain: { avoidModes: ['bike', 'walking'], delayFactor: 1.2, message: 'Rain expected - outdoor modes may be uncomfortable' },
        Snow: { avoidModes: ['bike', 'walking'], delayFactor: 1.5, message: 'Snow conditions - expect delays' },
        Clear: { delayFactor: 1.0, message: 'Clear weather - all modes available' },
        Clouds: { delayFactor: 1.0, message: 'Cloudy weather - good for travel' },
        Fog: { delayFactor: 1.2, message: 'Foggy conditions - drive carefully' },
        Drizzle: { avoidModes: ['bike'], delayFactor: 1.1, message: 'Light rain - caution advised' },
        Thunderstorm: { avoidModes: ['bike', 'walking'], delayFactor: 1.5, message: 'Storm warning - avoid outdoor travel' }
    };

    const condition = weatherConditions[weather.condition] || weatherConditions.Clear;

    let heatWarning = '';
    if (weather.temperature > 35) {
        heatWarning = 'Extreme heat - prefer AC transport';
        condition.avoidModes = [...(condition.avoidModes || []), 'bike', 'walking'];
    } else if (weather.temperature < 5) {
        heatWarning = 'Very cold - outdoor modes uncomfortable';
        condition.avoidModes = [...(condition.avoidModes || []), 'bike'];
    }

    return routes.map(route => {
        const hasAvoidedMode = route.modes?.some(mode =>
            condition.avoidModes?.includes(mode.type)
        );

        return {
            ...route,
            weather: {
                current: weather,
                impact: hasAvoidedMode ? 'high' : 'low',
                message: heatWarning || condition.message,
                adjustedDuration: hasAvoidedMode
                    ? Math.round(route.duration * condition.delayFactor)
                    : route.duration
            }
        };
    });
}

function isSuitableForOutdoor(weather) {
    const unsuitable = ['Rain', 'Snow', 'Thunderstorm'];
    if (unsuitable.includes(weather.condition)) return false;
    if (weather.temperature > 40 || weather.temperature < 0) return false;
    return true;
}

module.exports = {
    getWeatherForLocation,
    adjustRoutesForWeather,
    isSuitableForOutdoor
};
