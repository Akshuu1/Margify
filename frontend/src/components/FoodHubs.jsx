import { Coffee, Star, MapPin, X, Utensils } from "lucide-react"
import { useState } from "react"

export function FoodHubs({ hubStops, onClose }) {
    const [selectedCategory, setSelectedCategory] = useState('All')

    if (!hubStops) return null

    // Flatten all food stops from from/to hubs
    const allStops = []
    const categories = ['All']

    const processesStops = (obj, locationType) => {
        Object.keys(obj).forEach(mode => {
            const places = obj[mode]
            if (Array.isArray(places)) {
                places.forEach(place => {
                    allStops.push({
                        ...place,
                        hubMode: mode,
                        hubLocation: locationType
                    })
                })
            }
        })
    }

    processesStops(hubStops.from || {}, 'Start Area')
    processesStops(hubStops.to || {}, 'End Area')

    if (allStops.length === 0) return null

    const handleViewDetails = (place) => {
        const query = encodeURIComponent(place.name + " " + (place.vicinity || ""))
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
    }

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#1c1c1c]">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Utensils className="text-orange-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-[#e0e0e0]">Food & Snack Hubs</h3>
                        <p className="text-sm text-[#888]">{allStops.length} recommended spots near your transit hubs</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={24} className="text-[#e0e0e0]" />
                </button>
            </div>

            {/* Horizontal Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#161616]">
                <div className="flex gap-6 overflow-x-auto pb-8 pt-2 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: '#orange-400 #1c1c1c' }}>
                    {allStops.map((place, idx) => (
                        <div
                            key={`${place.id}-${idx}`}
                            className="flex-shrink-0 w-[300px] bg-[#1c1c1c] rounded-2xl overflow-hidden border border-white/5 hover:border-orange-500/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer snap-start flex flex-col group"
                            onClick={() => handleViewDetails(place)}
                        >
                            {/* Photo Placeholder / Image */}
                            <div className="relative h-32 bg-orange-500/5 flex items-center justify-center overflow-hidden">
                                {place.photo ? (
                                    <img src={place.photo} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80" />
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <Coffee size={32} className="text-orange-500/30" />
                                        <span className="text-[10px] text-orange-500/20 font-bold uppercase tracking-widest">Premium Spot</span>
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black uppercase text-orange-400 border border-orange-400/20 tracking-tighter">
                                    Near {place.hubLocation}
                                </div>
                                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                                    <Star size={10} className="text-orange-400 fill-orange-400" />
                                    <span className="text-white font-bold text-[10px]">{place.rating}</span>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h4 className="text-white font-bold text-base mb-1 line-clamp-1 group-hover:text-orange-400 transition-colors">
                                    {place.name}
                                </h4>
                                <p className="text-[10px] text-[#666] mb-3 flex items-center gap-1">
                                    <MapPin size={10} /> {place.vicinity.split(',')[0]}
                                </p>

                                <div className="mt-auto flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase text-[#444] tracking-widest">
                                        {place.hubMode} Hub
                                    </span>
                                    <div className="text-[10px] text-orange-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Menu/Directions →
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-[#1c1c1c] text-center text-[10px] text-[#555] font-medium tracking-wide">
                WE ONLY RECOMMEND SPOTS WITH 4.0+ RATINGS FOR MARGIFY USERS
            </div>
        </div>
    )
}
