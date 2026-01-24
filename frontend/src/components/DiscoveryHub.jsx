import React, { useEffect, useRef } from 'react';
import { Cloud, MapPin, Utensils, Star, Droplets, Wind, Navigation, Sparkles, Cloudy, Sun, CloudRain, CloudSnow, CloudLightning, Activity } from 'lucide-react';
import { gsap } from 'gsap';

export function DiscoveryHub({ weather, touristPlaces, hubPitStops, onShowTourist, onShowFood }) {
    const hubRef = useRef(null);
    const hasStops = hubPitStops && (Object.keys(hubPitStops.from || {}).length > 0 || Object.keys(hubPitStops.to || {}).length > 0);

    useEffect(() => {
        if (hubRef.current) {
            gsap.fromTo(hubRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
            );
        }
    }, [weather]);

    const getWeatherIcon = (condition) => {
        const cond = (condition || '').toLowerCase();
        const props = { size: 44, className: "text-[#FFCB74] drop-shadow-[0_0_8px_rgba(255,203,116,0.3)]" };
        if (cond.includes('rain')) return <CloudRain {...props} />;
        if (cond.includes('snow')) return <CloudSnow {...props} />;
        if (cond.includes('thunder')) return <CloudLightning {...props} />;
        if (cond.includes('cloud')) return <Cloud {...props} />;
        return <Sun {...props} />;
    };

    const UniversalWeatherCard = ({ data, label, type }) => {
        const iconRef = useRef(null);

        useEffect(() => {
            if (iconRef.current) {
                gsap.to(iconRef.current, {
                    y: -8,
                    duration: 3,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }
        }, []);

        if (!data || !data.current) return (
            <div className="flex-1 bg-[#2f2f2f] rounded-2xl border border-white/5 opacity-20 flex items-center justify-center min-h-[160px]">
                <Cloudy size={32} />
            </div>
        );

        return (
            <div className="flex-1 bg-[#2f2f2f] p-7 rounded-[1.5rem] border border-white/5 shadow-xl relative overflow-hidden group">
                {/* Branding Glow */}
                <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-[#FFCB74]/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-all duration-1000"></div>

                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#FFCB74]/10 text-[#FFCB74] rounded-xl border border-[#FFCB74]/10">
                            <MapPin size={16} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black tracking-widest text-white/30 leading-none mb-1">{type}</span>
                            <span className="text-base font-bold text-white tracking-tight">{label?.split(',')[0]}</span>
                        </div>
                    </div>
                    <div className="bg-white/5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-[#FFCB74]/60 border border-white/5">Synced</div>
                </div>

                <div className="flex items-center justify-between relative z-10 pr-2">
                    <div>
                        <div className="flex items-start">
                            <span className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">
                                {Math.round(data.current.temperature)}
                            </span>
                            <span className="text-3xl mt-1 font-bold text-[#FFCB74]">°</span>
                        </div>
                        <div className="text-[11px] text-white/50 font-bold uppercase tracking-[0.2em] mt-2 ml-1">{data.current.condition}</div>
                    </div>
                    <div ref={iconRef} className="pb-1">
                        {getWeatherIcon(data.current.condition)}
                    </div>
                </div>

                <div className="mt-8 pt-5 border-t border-white/5 flex gap-8 text-[11px] font-bold text-white/30 uppercase tracking-widest relative z-10">
                    <div className="flex items-center gap-2">
                        <Droplets size={14} className="text-[#FFCB74]/40" />
                        <span>{data.current.humidity}% <span className="opacity-40 font-medium">Hum</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Wind size={14} className="text-[#FFCB74]/40" />
                        <span>{data.current.windSpeed} <span className="opacity-40 font-medium">KM/H</span></span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div ref={hubRef} className="w-full mb-12 flex flex-col gap-5 px-1">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Unified Pro Weather (2/3) */}
                <div className="lg:col-span-8 flex flex-col md:flex-row gap-5">
                    <UniversalWeatherCard data={weather?.source} label={weather?.source?.location} type="Source" />
                    <UniversalWeatherCard data={weather?.destination} label={weather?.destination?.location} type="Destination" />
                </div>

                {/* Unified Pro Actions (1/3) */}
                <div className="lg:col-span-4 bg-[#2f2f2f] p-8 rounded-[1.5rem] border border-white/5 shadow-xl flex flex-col justify-between relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFCB74]/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#FFCB74]/10 transition-all"></div>

                    <div className="mb-6 relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="text-[#FFCB74]" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFCB74]/80 underline decoration-[#FFCB74]/20 underline-offset-4">Discovery Hub</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white leading-none tracking-tight">The Journey <br /><span className="text-white/40 font-medium italic">Experience</span></h3>
                    </div>

                    <div className="flex flex-col gap-3 relative z-10">
                        <button
                            onClick={onShowTourist}
                            disabled={!touristPlaces || touristPlaces.length === 0}
                            className={`w-full group/btn flex items-center justify-between p-5 rounded-2xl border transition-all active:scale-[0.97] ${touristPlaces?.length > 0
                                ? 'bg-white/5 border-white/10 hover:border-indigo-500/30'
                                : 'bg-white/1 border-transparent opacity-20 cursor-not-allowed'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white/5 rounded-xl group-hover/btn:bg-indigo-500/10 border border-white/5 transition-colors shadow-inner">
                                    <Navigation className="text-indigo-400 group-hover/btn:opacity-100 opacity-60" size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-white tracking-tight">Attractions</div>
                                    <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">{touristPlaces?.length || 0} Landmarks</div>
                                </div>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                        </button>

                        <button
                            onClick={onShowFood}
                            disabled={!hasStops}
                            className={`w-full group/btn flex items-center justify-between p-5 rounded-2xl border transition-all active:scale-[0.97] ${hasStops
                                ? 'bg-white/5 border-white/10 hover:border-orange-500/30'
                                : 'bg-white/1 border-transparent opacity-20 cursor-not-allowed'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white/5 rounded-xl group-hover/btn:bg-orange-500/10 border border-white/5 transition-colors shadow-inner">
                                    <Utensils className="text-orange-400 group-hover/btn:opacity-100 opacity-60" size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-white tracking-tight">Food Hubs</div>
                                    <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">Transit Picks</div>
                                </div>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${hasStops ? 'bg-orange-400 animate-pulse' : 'bg-white/5'}`}></div>
                        </button>
                    </div>
                </div>
            </div>
            {/* Native Spacing Footer */}
            <div className="pb-8 border-b border-white/5"></div>
        </div>
    );
}
