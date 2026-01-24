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
        const props = { size: 40, className: "text-[#FFCB74] opacity-80" };
        if (cond.includes('rain')) return <CloudRain {...props} />;
        if (cond.includes('snow')) return <CloudSnow {...props} />;
        if (cond.includes('thunder')) return <CloudLightning {...props} />;
        if (cond.includes('cloud')) return <Cloud {...props} />;
        return <Sun {...props} />;
    };
    const WeatherCard = ({ data, label, type }) => {
        if (!data || !data.current) return (
            <div className="flex-1 bg-[#1c1c1c] rounded-2xl p-6 border border-white/5 opacity-30 flex items-center justify-center min-h-[160px]">
                <Cloudy size={24} />
            </div>
        );
        return (
            <div className="flex-1 bg-[#1c1c1c] p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFCB74]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#FFCB74]/10 transition-all"></div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#FFCB74]/10 rounded-xl">
                            <MapPin size={14} className="text-[#FFCB74]" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FFCB74]/70">{type} • {data.location?.split(',')[0]}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between relative z-10 pr-2">
                    <div>
                        <div className="flex items-start">
                            <span className="text-6xl font-medium text-white tracking-tighter">
                                {Math.round(data.current.temperature)}
                            </span>
                            <span className="text-3xl mt-1 font-bold text-[#FFCB74]">°</span>
                        </div>
                        <div className="text-[11px] text-white/50 font-bold uppercase tracking-widest mt-2">{data.current.condition}</div>
                    </div>
                    <div className="group-hover:scale-110 transition-transform duration-500">
                        {getWeatherIcon(data.current.condition)}
                    </div>
                </div>
                <div className="mt-8 pt-5 border-t border-white/5 flex gap-8 text-[10px] font-bold text-white/30 uppercase tracking-widest relative z-10">
                    <div className="flex items-center gap-2">
                        <Droplets size={12} className="text-[#FFCB74]/40" />
                        <span>{data.current.humidity}% <span className="opacity-40 font-medium lowercase">humidity</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Wind size={12} className="text-[#FFCB74]/40" />
                        <span>{data.current.windSpeed} <span className="opacity-40 font-medium lowercase">km/h</span></span>
                    </div>
                </div>
            </div>
        );
    };
    return (
        <div ref={hubRef} className="w-full mb-10 space-y-4 px-1">
            <div className="flex flex-col xl:flex-row gap-6">
                <div className="xl:flex-[2] flex flex-col md:flex-row gap-6">
                    <WeatherCard data={weather?.source} label={weather?.source?.location} type="Source" />
                    <WeatherCard data={weather?.destination} label={weather?.destination?.location} type="Dest" />
                </div>
                <div className="xl:flex-[1] bg-[#1c1c1c] p-8 rounded-2xl border border-white/10 shadow-xl flex flex-col justify-between relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFCB74]/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#FFCB74]/10 transition-all"></div>
                    <div className="mb-6 relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="text-[#FFCB74]" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFCB74]/80">Intelligence</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white tracking-tighter leading-none">Discovery <br /><span className="text-white/30 italic font-medium tracking-normal text-2xl">Hub</span></h3>
                    </div>
                    <div className="flex flex-col gap-3.5 mt-auto relative z-10">
                        <button
                            onClick={onShowTourist}
                            disabled={!touristPlaces || touristPlaces.length === 0}
                            className={`w-full group/btn flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 active:scale-[0.97] ${touristPlaces?.length > 0
                                ? 'bg-white/5 border-white/5 hover:border-indigo-500/40 hover:bg-[#FFCB74]/5'
                                : 'bg-white/1 border-transparent opacity-20 cursor-not-allowed'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white/5 rounded-xl group-hover/btn:bg-indigo-500/10 border border-white/10 transition-colors shadow-inner">
                                    <Navigation className="text-indigo-400 group-hover/btn:opacity-100 opacity-60" size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-white tracking-tight">Attractions</div>
                                    <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{touristPlaces?.length || 0} Landmarks</div>
                                </div>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover/btn:bg-indigo-500 transition-colors"></div>
                        </button>
                        <button
                            onClick={onShowFood}
                            disabled={!hasStops}
                            className={`w-full group/btn flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 active:scale-[0.97] ${hasStops
                                ? 'bg-white/5 border-white/5 hover:border-orange-500/40 hover:bg-[#FFCB74]/5'
                                : 'bg-white/1 border-transparent opacity-20 cursor-not-allowed'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white/5 rounded-xl group-hover/btn:bg-orange-500/10 border border-white/10 transition-colors shadow-inner">
                                    <Utensils className="text-orange-400 group-hover/btn:opacity-100 opacity-60" size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-white tracking-tight">Food Hubs</div>
                                    <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">Elite Selection</div>
                                </div>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${hasStops ? 'bg-orange-400 animate-pulse' : 'bg-white/10'}`}></div>
                        </button>
                    </div>
                </div>
            </div>
            <div className="pb-6 border-b border-white/5"></div>
        </div>
    );
}
