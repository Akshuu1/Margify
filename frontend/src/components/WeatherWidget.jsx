import React from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Clock, MapPin } from 'lucide-react';

const WeatherWidget = ({ weather }) => {
    if (!weather || !weather.source || !weather.destination) return null;

    const { source, destination } = weather;

    const getWeatherIcon = (condition) => {
        const cond = condition.toLowerCase();
        if (cond.includes('rain')) return <CloudRain className="w-5 h-5 text-blue-400" />;
        if (cond.includes('drizzle')) return <CloudRain className="w-5 h-5 text-blue-300" />;
        if (cond.includes('snow')) return <CloudSnow className="w-5 h-5 text-white" />;
        if (cond.includes('thunder')) return <CloudLightning className="w-5 h-5 text-yellow-400" />;
        if (cond.includes('cloud')) return <Cloud className="w-5 h-5 text-gray-400" />;
        return <Sun className="w-5 h-5 text-yellow-500" />;
    };

    const getCurrentTime = () => {
        return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const WeatherCard = ({ data, label }) => {
        const { current } = data;
        if (!current) return null;

        return (
            <div className="bg-gradient-to-br from-[#2f2f2f] to-[#1a1a1a] rounded-xl p-4 border border-white/10 hover:border-[#FFCB74]/30 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                    <MapPin size={14} className="text-[#FFCB74]" />
                    <span className="text-xs text-[#999] uppercase tracking-wide font-semibold">{label}</span>
                </div>

                <div className="flex items-start justify-between mb-3">
                    <div>
                        <div className="text-3xl font-bold text-[#e0e0e0]">
                            {Math.round(current.temperature)}°C
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            {getWeatherIcon(current.condition)}
                            <span className="text-sm text-[#999]">{current.condition}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-[#999] mb-2">
                    <div className="flex items-center gap-1">
                        <Droplets size={12} />
                        <span>{current.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Wind size={12} />
                        <span>{current.windSpeed} m/s</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-[#666] pt-2 border-t border-white/5">
                    <Clock size={12} />
                    <span>{getCurrentTime()}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WeatherCard data={source} label={source.location} />
                <WeatherCard data={destination} label={destination.location} />
            </div>
        </div>
    );
};

export default WeatherWidget;
