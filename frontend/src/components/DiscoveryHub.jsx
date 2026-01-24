import React, { useEffect, useRef } from 'react';
import { Cloud, MapPin, Utensils, Star, Droplets, Wind, Navigation, Sparkles, Cloudy, Sun, CloudRain, CloudSnow, CloudLightning, Activity } from 'lucide-react';
import { gsap } from 'gsap';

export function DiscoveryHub({ weather, touristPlaces, hubPitStops, onShowTourist, onShowFood }) {
    const hubRef = useRef(null);
    const hasStops = hubPitStops && (Object.keys(hubPitStops.from || {}).length > 0 || Object.keys(hubPitStops.to || {}).length > 0);

    useEffect(() => {
        if (hubRef.current) {
            gsap.fromTo(hubRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, ease: "expo.out" }
            );
        }
    }, [weather]);

    const getWeatherIcon = (condition) => {
        const cond = (condition || '').toLowerCase();
        const props = { size: 32, className: "text-[#FFCB74] drop-shadow-[0_0_15px_rgba(255,203,116,0.4)]" };
        if (cond.includes('rain')) return <CloudRain {...props} />;
        if (cond.includes('snow')) return <CloudSnow {...props} />;
        if (cond.includes('thunder')) return <CloudLightning {...props} />;
        if (cond.includes('cloud')) return <Cloud {...props} />;
        return <Sun {...props} />;
    };

    const ReducedCinematicWeather = ({ data, label, isDest }) => {
        const iconRef = useRef(null);

        useEffect(() => {
            if (iconRef.current) {
                gsap.to(iconRef.current, {
                    y: -10,
                    duration: 3,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }
        }, []);

        if (!data || !data.current) return null;

        return (
            <div className="flex-1 bg-gradient-to-br from-[#111] to-[#050505] p-5 rounded-[2rem] border border-[#FFCB74]/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)] relative overflow-hidden group transition-all duration-700 hover:border-[#FFCB74]/30">
                {/* Compact Ambient Glow */}
                <div className={`absolute top-[-20%] right-[-10%] w-48 h-48 bg-[#FFCB74]/${isDest ? '10' : '5'} rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-1000`}></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 flex items-center justify-center bg-[#FFCB74]/10 text-[#FFCB74] rounded-xl border border-[#FFCB74]/10">
                            <MapPin size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FFCB74] opacity-50">{isDest ? 'Arrival' : 'Departure'}</span>
                            <span className="text-xl font-bold text-white tracking-tight">{label?.split(',')[0]}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-start">
                                <span className="text-5xl font-light text-white leading-none tracking-tighter">
                                    {Math.round(data.current.temperature)}
                                </span>
                                <span className="text-2xl font-bold text-[#FFCB74] mt-1 ml-0.5">°</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#FFCB74] shadow-[0_0_10px_rgba(255,203,116,0.8)]"></div>
                                <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">{data.current.condition}</span>
                            </div>
                        </div>
                        <div ref={iconRef} className="pr-2">
                            {getWeatherIcon(data.current.condition)}
                        </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-white/5 flex items-center gap-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Humidity</span>
                            <div className="flex items-center gap-2">
                                <Droplets size={12} className="text-[#FFCB74]/40" />
                                <span className="text-base font-bold text-white/80">{data.current.humidity}%</span>
                            </div>
                        </div>
                        <div className="h-6 w-[1px] bg-white/5"></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Wind</span>
                            <div className="flex items-center gap-2">
                                <Wind size={12} className="text-[#FFCB74]/40" />
                                <span className="text-base font-bold text-white/80">{data.current.windSpeed} <span className="text-[9px] opacity-30">KM/H</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div ref={hubRef} className="w-full mb-12 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Reduced Cinematic Weather Block (2/3) */}
                <div className="xl:col-span-8 flex flex-col md:flex-row gap-6">
                    <ReducedCinematicWeather data={weather?.source} label={weather?.source?.location} />
                    <ReducedCinematicWeather data={weather?.destination} label={weather?.destination?.location} isDest />
                </div>

                {/* Experience Command Center (1/3) */}
                <div className="xl:col-span-4 bg-[#0a0a0a] p-6 rounded-[2rem] border border-white/5 shadow-2xl flex flex-col justify-between relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFCB74]/5 rounded-full blur-[100px] pointer-events-none transition-all duration-1000 group-hover:bg-[#FFCB74]/10"></div>

                    <div className="relative z-10 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="text-[#FFCB74]" size={14} />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FFCB74]/60">Journey Insights</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white leading-tight tracking-tight">The Extra <span className="text-white/20 italic font-medium tracking-normal">Mile</span></h3>
                    </div>

                    <div className="flex flex-col gap-3 relative z-10">
                        <button
                            onClick={onShowTourist}
                            disabled={!touristPlaces || touristPlaces.length === 0}
                            className={`w-full group/btn flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 active:scale-[0.98] ${touristPlaces?.length > 0
                                ? 'bg-white/[0.03] border-white/5 hover:border-[#FFCB74]/40 hover:bg-[#FFCB74]/5'
                                : 'bg-white/1 border-transparent opacity-20 cursor-not-allowed'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white/5 rounded-xl group-hover/btn:bg-[#FFCB74]/20 transition-colors border border-white/10">
                                    <Navigation className="text-[#FFCB74]" size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-white tracking-tight">Attractions</div>
                                    <div className="text-[9px] text-[#FFCB74]/60 font-black uppercase tracking-[0.2em]">{touristPlaces?.length || 0} Found</div>
                                </div>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FFCB74]/40 group-hover/btn:bg-[#FFCB74] transition-colors"></div>
                        </button>

                        <button
                            onClick={onShowFood}
                            disabled={!hasStops}
                            className={`w-full group/btn flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 active:scale-[0.98] ${hasStops
                                ? 'bg-white/[0.03] border-white/5 hover:border-orange-500/40 hover:bg-orange-500/5'
                                : 'bg-white/1 border-transparent opacity-20 cursor-not-allowed'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white/5 rounded-xl group-hover/btn:bg-orange-500/20 transition-colors border border-white/10">
                                    <Utensils className="text-orange-400" size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-white tracking-tight">Food Hubs</div>
                                    <div className="text-[9px] text-orange-400/60 font-black uppercase tracking-[0.2em]">Elite Selection</div>
                                </div>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${hasStops ? 'bg-orange-500 animate-pulse shadow-[0_0_10px_#f97316]' : 'bg-white/10'}`}></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
