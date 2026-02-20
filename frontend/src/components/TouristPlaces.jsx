import { MapPin, Star, Navigation, X } from "lucide-react"
import { useState } from "react"

export function TouristPlaces({ places, onClose }) {
    const [selectedPlace, setSelectedPlace] = useState(null)
    const [showAll, setShowAll] = useState(false)

    if (!places || places.length === 0) {
        return null
    }

    const displayPlaces = showAll ? places : places.slice(0, 8);

    const handleViewDetails = (place) => {
        const query = encodeURIComponent(place.name + " " + (place.vicinity || ""))
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${place.id}`, '_blank')
    }

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FFCB74]/20 rounded-lg">
                        <MapPin className="text-[#FFCB74]" size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-[#e0e0e0]">Places to Visit</h3>
                        <p className="text-sm text-[#888]">{places.length} attractions found</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={24} className="text-[#e0e0e0]" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex gap-6 overflow-x-auto pb-8 pt-2 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: '#FFCB74 #1c1c1c' }}>
                    {displayPlaces.map((place, idx) => {
                        const fallbacks = [
                            "https://images.unsplash.com/photo-1548013146-72479768bbaa?q=80&w=2673",
                            "https://images.unsplash.com/photo-1564507592333-c60657eaa0ae?q=80&w=2670",
                            "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2922",
                            "https://images.unsplash.com/photo-1524492707947-54b036573c00?q=80&w=2000"
                        ];
                        const fallback = fallbacks[idx % fallbacks.length];

                        return (
                            <div
                                key={place.id}
                                className="flex-shrink-0 w-[280px] sm:w-[350px] bg-gradient-to-br from-[#2f2f2f] to-[#1c1c1c] rounded-xl overflow-hidden border border-white/10 hover:border-[#FFCB74]/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#FFCB74]/10 cursor-pointer snap-start"
                                onClick={() => handleViewDetails(place)}
                            >
                                <div className="relative w-full h-48 overflow-hidden group">
                                    <img
                                        src={place.photo || fallback}
                                        alt={place.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = fallback;
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                                        <Star size={14} className="text-[#FFCB74] fill-[#FFCB74]" />
                                        <span className="text-white font-bold text-sm">{place.rating.toFixed(1)}</span>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h4 className="text-[#e0e0e0] font-bold text-base mb-2 line-clamp-2 leading-tight">
                                        {place.name}
                                    </h4>

                                    <div className="flex items-center gap-2 text-sm text-[#888] mb-2">
                                        <div className="flex items-center gap-1 bg-[#FFCB74]/10 px-2 py-0.5 rounded">
                                            <Star size={12} className="text-[#FFCB74]" />
                                            <span className="text-[#FFCB74] font-medium text-xs">{place.rating.toFixed(1)}</span>
                                        </div>
                                        <span className="text-[#666] text-xs">•</span>
                                        <span className="text-xs">{place.userRatingsTotal.toLocaleString()} reviews</span>
                                    </div>

                                    {place.vicinity && (
                                        <p className="text-xs text-[#666] mb-3 line-clamp-2 leading-relaxed">{place.vicinity}</p>
                                    )}

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleViewDetails(place)
                                        }}
                                        className="w-full bg-gradient-to-r from-[#FFCB74] to-[#ffd88a] text-[#111111] py-2 px-3 rounded-lg text-xs font-bold hover:from-[#ffd88a] hover:to-[#FFCB74] transition-all duration-300 flex items-center justify-center gap-2">
                                        <Navigation size={12} />
                                        Open in Maps
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>


                {places.length > 8 && (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="px-6 py-2 bg-[#2f2f2f] text-[#e0e0e0] rounded-lg hover:bg-[#3f3f3f] transition-colors text-sm font-medium"
                        >
                            {showAll ? 'Show Less' : `View More (${places.length - 8} more)`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
