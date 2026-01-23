const axios = require('axios');

// OpenWeatherMap API configuration
const API_KEY = process.env.OPENWEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Get weather data for a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<object>} Weather data
 */
async function getWeatherForLocation(lat, lng) {
    try {
        // HARDCODE KEY FOR DEBUGGING if env var fails
        const apiKey = process.env.OPENWEATHER_API_KEY || 'e8f7b9c2d3a5f1e6b8c9d2a4f7e3b6c5';

        console.log(`Fetching weather for ${lat},${lng} with key length: ${apiKey ? apiKey.length : 0}`);

        const response = await axios.get(`${BASE_URL}/weather`, {
            params: {
                lat,
                lon: lng,
                appid: apiKey,
                units: 'metric'
            }
        });

        const data = response.data;
        console.log(`Weather fetch successful: ${data.main.temp}°C, ${data.weather[0].main}`);

        return {
            temperature: data.main.temp,
            feelsLike: data.main.feels_like,
            condition: data.weather[0].main, // 'Rain', 'Clear', 'Snow', etc.
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            icon: data.weather[0].icon
        };
    } catch (error) {
        console.error('CRITICAL WEATHER API ERROR:', error.response?.data || error.message);
        // THROW ERROR to avoid showing fake 25 degree data
        throw error;
    }
}

/**
 * Get 3-hour forecast weather data
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<object>} Forecast data
 */
async function getWeatherForecast(lat, lng) {
    try {
        if (!API_KEY) {
            return getMockForecast();
        }

        const response = await axios.get(`${BASE_URL}/forecast`, {
            params: {
                lat,
                lon: lng,
                appid: API_KEY,
                units: 'metric',
                cnt: 8 // Next 24 hours (3-hour intervals)
            }
        });

        return response.data.list.map(item => ({
            time: new Date(item.dt * 1000),
            temperature: item.main.temp,
            condition: item.weather[0].main,
            description: item.weather[0].description,
            rainProbability: item.pop * 100 // Probability of precipitation
        }));
    } catch (error) {
        console.error('Error fetching forecast:', error.message);
        return getMockForecast();
    }
}

/**
 * Adjust route recommendations based on weather
 * @param {Array} routes - Array of route options
 * @param {object} weather - Weather data
 * @returns {Array} Adjusted routes with weather impact
 */
function adjustRoutesForWeather(routes, weather) {
    const weatherConditions = {
        Rain: { avoidModes: ['bike', 'walking'], delayFactor: 1.2, message: 'Rain expected - outdoor modes may be uncomfortable' },
        Snow: { avoidModes: ['bike', 'walking'], delayFactor: 1.5, message: 'Snow conditions - expect delays' },
        Clear: { delayFactor: 1.0, message: 'Clear weather - all modes available' },
        Clouds: { delayFactor: 1.0, message: 'Cloudy weather - good for travel' }
    };

    const condition = weatherConditions[weather.condition] || weatherConditions.Clear;

    // Temperature adjustments
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

/**
 * Check if weather is suitable for outdoor activities
 * @param {object} weather - Weather data
 * @returns {boolean} True if suitable
 */
function isSuitableForOutdoor(weather) {
    const unsuitable = ['Rain', 'Snow', 'Thunderstorm'];
    if (unsuitable.includes(weather.condition)) return false;
    if (weather.temperature > 40 || weather.temperature < 0) return false;
    return true;
}

/**
 * Mock weather data for testing without API key
 */
function getMockWeather() {
    return {
        temperature: 25,
        feelsLike: 27,
        condition: 'Clear',
        description: 'clear sky',
        humidity: 60,
        windSpeed: 3.5,
        icon: '01d'
    };
}

/**
 * Mock forecast data
 */
function getMockForecast() {
    const now = new Date();
    return Array.from({ length: 8 }, (_, i) => ({
        time: new Date(now.getTime() + i * 3 * 60 * 60 * 1000),
        temperature: 25 + Math.random() * 5,
        condition: 'Clear',
        description: 'clear sky',
        rainProbability: 10
    }));
}

module.exports = {
    getWeatherForLocation,
    getWeatherForecast,
    adjustRoutesForWeather,
    isSuitableForOutdoor
};
