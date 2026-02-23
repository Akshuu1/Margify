import React, { useEffect, useRef } from 'react';
import { Cloud, MapPin, Utensils, Star, Droplets, Wind, Navigation, Sparkles, Cloudy, Sun, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';
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
        <div ref={hubRef} className="w-full mb-12 space-y-6 px-1">
            <div className="flex flex-col xl:flex-row gap-8">
                <div className="xl:flex-[2] flex flex-col md:flex-row gap-6">
                    <WeatherCard data={weather?.source} label={weather?.source?.location} type="Departing from" />
                    <WeatherCard data={weather?.destination} label={weather?.destination?.location} type="Arriving at" />
                </div>

                <div className="xl:flex-[1] bg-gradient-to-br from-[#1c1c1c] to-[#111111] p-10 rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col justify-between relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFCB74]/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#FFCB74]/15 transition-all duration-700"></div>

                    <div className="mb-10 relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#FFCB74]/20 rounded-lg">
                                <Sparkles className="text-[#FFCB74]" size={16} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFCB74]">Intelligence</span>
                        </div>
                        <h3 className="text-4xl font-bold text-white tracking-tighter leading-none">Discovery <br /><span className="text-[#FFCB74]/40 italic font-medium tracking-normal text-3xl">Hub</span></h3>
                    </div>

                    <div className="flex flex-col gap-4 mt-auto relative z-10">
                        <button
                            onClick={onShowTourist}
                            disabled={!touristPlaces || touristPlaces.length === 0}
                            className={`w-full group/btn flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-500 active:scale-[0.98] ${touristPlaces?.length > 0
                                ? 'bg-white/[0.03] border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.07] shadow-xl'
                                : 'bg-white/[0.01] border-transparent opacity-20 cursor-not-allowed'}`}
                        >
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover/btn:bg-indigo-500/20 transition-colors shadow-inner border border-indigo-500/20">
                                    <Navigation className="text-indigo-400" size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="text-base font-bold text-white tracking-tight">Attractions</div>
                                    <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">{touristPlaces?.length || 0} Discovery Points</div>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-white/20 group-hover/btn:text-indigo-400 group-hover/btn:translate-x-1 transition-all" />
                        </button>

                        <button
                            onClick={onShowFood}
                            disabled={!hasStops}
                            className={`w-full group/btn flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-500 active:scale-[0.98] ${hasStops
                                ? 'bg-[#FFCB74]/5 border-[#FFCB74]/20 hover:border-[#FFCB74]/60 hover:bg-[#FFCB74]/10 shadow-2xl shadow-[#FFCB74]/5'
                                : 'bg-white/[0.01] border-transparent opacity-20 cursor-not-allowed'}`}
                        >
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-[#FFCB74]/10 rounded-2xl group-hover/btn:bg-[#FFCB74]/20 transition-colors shadow-inner border border-[#FFCB74]/20">
                                    <Utensils className="text-[#FFCB74]" size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="text-base font-bold text-white tracking-tight">Food Hubs</div>
                                    <div className="text-[10px] text-[#FFCB74]/60 font-black uppercase tracking-widest mt-1">Gourmet Selection</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${hasStops ? 'bg-[#FFCB74] shadow-[0_0_15px_rgba(255,203,116,0.8)] animate-pulse' : 'bg-white/10'}`}></div>
                                <ChevronRight size={18} className="text-[#FFCB74]/20 group-hover/btn:text-[#FFCB74] group-hover/btn:translate-x-1 transition-all" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
            <div className="pb-8 border-b border-white/5 opacity-50"></div>
        </div>
    );
};

const ChevronRight = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m9 18 6-6-6-6" />
    </svg>
)
