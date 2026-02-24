import { TimelineSegment } from "./TimelineSegment"
import { formatDuration, formatCurrency } from "../utils/format"
import { Users, Shield, Bookmark, BookmarkPlus, Sparkles, Luggage, Map as MapIcon } from "lucide-react"
import { useState } from "react"
import { saveRouteOption } from "../services/savedRoutesApi"
import MapModal from "./MapModal"

export function RouteCard({ route, source, destination, hubPitStops }) {
  const segments = route.segments || []
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showMap, setShowMap] = useState(false)

  const handleSaveOption = async (e) => {
    e.stopPropagation();
    if (isBookmarked) return;

    const name = prompt("Name this route option:", `${route.tag || 'Best'} Option`);
    if (!name) return;

    try {
      await saveRouteOption({
        routeName: name,
        source: {
          address: source.name,
          coordinates: { lat: source.lat, lng: source.lng }
        },
        destination: {
          address: destination.name,
          coordinates: { lat: destination.lat, lng: destination.lng }
        },
        route: route
      });
      setIsBookmarked(true);
      alert('Specific route option saved!');
    } catch (err) {
      alert('Failed to save route option');
    }
  };

  const TAG_STYLES = {
    Cheapest: "bg-[#b7e28b] text-[#111111]",
    Fastest: "bg-[#7db3ff] text-[#111111]",
    Best: "bg-[#FFCB74] text-[#111111]",
    Luxury: "bg-[#d6a8ff] text-[#111111]",
    Alternative: "bg-[#cba880] text-[#e0e0e0] border border-white/10",
    Economy: "bg-[#b7e28b] text-[#111111]",
    Premium: "bg-[#d6a8ff] text-[#111111]",
    "Smart Choice": "bg-gradient-to-r from-[#00d4ff] via-[#0ea5e9] to-[#06b6d4] text-white font-bold shadow-lg shadow-cyan-500/50 border border-cyan-400/30",
    "Eco-Friendly": "bg-emerald-400 text-[#111111]",
  }

  const VIBE_STYLES = {
    Scenic: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Social: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    Quiet: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    Efficient: "bg-amber-500/20 text-amber-300 border-amber-500/30"
  }

  const tagClass =
    TAG_STYLES[route.tag] || "bg-[#2f2f2f] text-[#e0e0e0]"

  return (
    <div className="bg-gradient-to-br from-[#2f2f2f] to-[#1a1a1a] rounded-2xl p-4 sm:p-6 w-full flex flex-col justify-between h-auto border border-white/5 hover:border-white/10 transition-all shadow-lg hover:shadow-xl hover:shadow-white/5">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-wrap gap-2">
          {route.tag && (
            <span className={`${tagClass} px-3 sm:px-4 py-1 rounded-full text-[10px] sm:text-sm font-medium whitespace-nowrap`}>
              {route.tag}
            </span>
          )}

          <button
            onClick={() => setShowMap(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1 rounded-full text-[10px] sm:text-sm font-medium bg-white/10 hover:bg-[#FFCB74] hover:text-[#111111] transition-all border border-white/5"
          >
            <MapIcon size={12} className="sm:w-[14px] sm:h-[14px]" />
            Map View
          </button>

          {route.vibe && (
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${VIBE_STYLES[route.vibe] || VIBE_STYLES.Efficient}`}>
              <Sparkles size={12} />
              {route.vibe} Vibe
            </span>
          )}



          {route.crowdDensity && (
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${route.crowdDensity === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
              route.crowdDensity === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                'bg-green-500/20 text-green-300 border-green-500/30'
              }`}>
              <Users size={12} />
              {route.crowdDensity === 'high' ? 'Busy' :
                route.crowdDensity === 'medium' ? 'Moderate' : 'Quiet'}
            </span>
          )}

          {route.safetyScore && (
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${route.safetyScore >= 90 ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
              route.safetyScore >= 70 ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                'bg-orange-500/20 text-orange-300 border-orange-500/30'
              }`}>
              <Shield size={12} />
              {route.safetyScore}% Safe
            </span>
          )}


        </div>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        {segments.map((segment, index) => (
          <TimelineSegment
            key={index}
            segment={segment}
            isLast={index === segments.length - 1}
            pitStops={hubPitStops}
          />
        ))}
      </div>
      <div className="bg-[#FFCB74] text-[#111111] rounded-xl mt-6 px-3 sm:px-4 py-3 grid grid-cols-2 lg:flex lg:justify-between items-center gap-y-3 sm:gap-x-4 text-[10px] sm:text-sm font-medium">
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" className="sm:w-4 sm:h-4"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2m3.3 14.71L11 12.41V7h2v4.59l3.71 3.71z" /></svg>
          <span className="whitespace-nowrap">{formatDuration(route.totalTime)}</span>
        </div>

        <div className="flex items-center gap-1 sm:border-l border-black/20 sm:pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" className="sm:w-4 sm:h-4">
            <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5" />
          </svg>
          <span className="whitespace-nowrap">{segments.reduce((acc, curr) => acc + parseFloat(curr.distance || 0), 0).toFixed(1)} km</span>
        </div>

        <div className="flex items-center gap-1 sm:border-l border-black/20 sm:pl-3 col-span-2 sm:col-auto justify-start py-2 sm:py-0 border-t border-black/10 sm:border-t-0">
          <span className="font-bold">{formatCurrency(route.priceRange.min)} – {formatCurrency(route.priceRange.max)}</span>
        </div>

        <div className="hidden md:flex items-center gap-1 border-l border-black/20 pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" className="sm:w-4 sm:h-4">
            <path fill="currentColor" d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3M21 9l-3.99-4v3H10v2h7.01v3L21 9" />
          </svg>
          <span className="whitespace-nowrap">{route.transfers} Transfers</span>
        </div>

        <div className="flex items-center justify-end gap-2 sm:ml-2">
          <button
            onClick={handleSaveOption}
            className="p-1.5 bg-black/10 rounded-lg hover:bg-black/20 transition-all active:scale-95"
            title="Bookmark Specific Route"
          >
            {isBookmarked ? <Bookmark size={16} fill="currentColor" /> : <BookmarkPlus size={16} />}
          </button>
        </div>
      </div>

      {showMap && (
        <MapModal segments={segments} onClose={() => setShowMap(false)} />
      )}
    </div>
  )
}
