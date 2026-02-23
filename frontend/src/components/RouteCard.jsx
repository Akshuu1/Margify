import { TimelineSegment } from "./TimelineSegment"
import { formatDuration, formatCurrency } from "../utils/format"
import { Users, Shield, Bookmark, BookmarkPlus, Sparkles, Luggage, Map as MapIcon, Share2, Car } from "lucide-react"
import { useState, useMemo } from "react"
import { saveRouteOption } from "../services/savedRoutesApi"
import MapModal from "./MapModal"
import CabBookingPanel from "./CabBookingPanel"

export function RouteCard({ route, source, destination, hubPitStops }) {
  const segments = route.segments || []
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showCabBooking, setShowCabBooking] = useState(false)

  // Find the first CAB/AUTO segment for booking
  const cabSegment = useMemo(() => {
    return segments.find(s => s.mode === 'CAB' || s.mode === 'AUTO')
  }, [segments])
  const hasCabSegment = !!cabSegment

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
    } catch (err) {
      alert('Failed to save route option');
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();

    const journeySummary = segments.map((seg, i) =>
      `${i + 1}. ${seg.mode}: ${seg.from} ➔ ${seg.to} (${seg.duration} min, ${seg.distance} km)`
    ).join('\n');

    const shareText = `🚀 Margify Route: ${source.name} to ${destination.name}
━━━━━━━━━━━━━━━━━━━━
⏱️ Total Time: ${formatDuration(route.totalTime)}
💰 Price: ${formatCurrency(route.priceRange.min)} - ${formatCurrency(route.priceRange.max)}
🔄 Transfers: ${route.transfers}
✨ Tag: ${route.tag || 'Standard'}

🛤️ Journey Path:
${journeySummary}

Find your best path with Margify!`;

    if (navigator.share) {
      navigator.share({
        title: `Margify Route Details`,
        text: shareText,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(`${shareText}\n\nLink: ${window.location.href}`);
      alert('Journey details copied to clipboard!');
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
    "Smart Choice": "bg-gradient-to-r from-[#FFCB74] via-[#fcd34d] to-[#fbbf24] text-[#111111] font-black shadow-lg shadow-[#FFCB74]/20 border border-white/20",
    "Eco-Friendly": "bg-emerald-400 text-[#111111]",
    "Not Recommended": "bg-[#444444] text-[#aaaaaa] border border-white/10 opacity-60",
  }

  const VIBE_STYLES = {
    Scenic: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Social: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    Quiet: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    Efficient: "bg-amber-500/20 text-amber-300 border-amber-500/30"
  }

  const tagClass =
    TAG_STYLES[route.tag] || "bg-white/10 text-white/70"

  return (
    <div className={`relative overflow-hidden transition-all duration-500 group/card ${route.tag === "Smart Choice"
      ? 'border-[#FFCB74]/40 bg-gradient-to-br from-[#1a1a1a] via-[#111111] to-[#0a0a0a]'
      : 'border-white/10 bg-[#161616]'
      } ${route.tag === "Not Recommended" ? 'opacity-40 grayscale-[0.9]' : 'opacity-100'} rounded-[1.5rem] p-6 w-full flex flex-col justify-between h-auto border shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[#FFCB74]/10 hover:border-[#FFCB74]/40 active:scale-[0.99]`}>

      {route.tag === "Smart Choice" && (
        <>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFCB74]/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none group-hover/card:bg-[#FFCB74]/10 transition-all duration-700"></div>
          <div className="absolute -inset-[1px] bg-gradient-to-r from-[#FFCB74]/40 via-transparent to-[#FFCB74]/20 rounded-[1.5rem] opacity-30 group-hover/card:opacity-60 transition-opacity pointer-events-none"></div>
        </>
      )}

      <div className="flex flex-wrap justify-between items-start gap-4 mb-8 relative z-10">
        <div className="flex flex-wrap gap-2.5">
          {route.tag && (
            <span className={`${tagClass} px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-2xl border border-white/5`}>
              {route.tag === "Smart Choice" && <Sparkles size={12} className="text-[#111111] animate-pulse" />}
              {route.tag === "Not Recommended" && <Bookmark size={12} />}
              {route.tag}
            </span>
          )}

          <button
            onClick={() => setShowMap(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-[#FFCB74] hover:text-[#111111] transition-all border border-white/10 active:scale-95 text-white/60"
          >
            <MapIcon size={12} />
            Map
          </button>

          {hasCabSegment && (
            <button
              onClick={() => setShowCabBooking(!showCabBooking)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border active:scale-95 shadow-lg ${showCabBooking
                  ? 'bg-[#FFCB74] text-[#111111] border-[#FFCB74]'
                  : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-[#111111] border-emerald-500/20'
                }`}
            >
              <Car size={12} />
              {showCabBooking ? 'Close' : 'Book Cab'}
            </button>
          )}

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-[#FFCB74]/10 hover:bg-[#FFCB74] text-[#FFCB74] hover:text-[#111111] transition-all border border-[#FFCB74]/20 active:scale-95 shadow-lg shadow-[#FFCB74]/5"
          >
            <Share2 size={12} strokeWidth={3} />
            Share
          </button>
        </div>

        <div className="flex gap-2">
          {route.vibe && (
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${VIBE_STYLES[route.vibe] || VIBE_STYLES.Efficient}`}>
              {route.vibe}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1 relative z-10">
        {segments.map((segment, index) => (
          <TimelineSegment
            key={index}
            segment={segment}
            isLast={index === segments.length - 1}
            pitStops={hubPitStops}
          />
        ))}
      </div>

      <div className="bg-white/[0.03] backdrop-blur-md rounded-[1.5rem] mt-8 p-5 grid grid-cols-2 md:flex md:justify-between items-center gap-4 border border-white/5 relative z-10 transition-colors group-hover/card:bg-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-[#FFCB74]"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2m3.3 14.71L11 12.41V7h2v4.59l3.71 3.71z" /></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">Time</span>
            <span className="text-xs font-bold text-white leading-none mt-1">{formatDuration(route.totalTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 md:border-l md:border-white/10 md:pl-5">
          <div className="p-2 bg-white/5 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-[#FFCB74]">
              <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">Dist</span>
            <span className="text-xs font-bold text-white leading-none mt-1">{segments.reduce((acc, curr) => acc + parseFloat(curr.distance || 0), 0).toFixed(1)} km</span>
          </div>
        </div>

        <div className="flex items-center gap-3 md:border-l md:border-white/10 md:pl-5 col-span-2 md:col-auto">
          <div className="p-2 bg-[#FFCB74]/10 rounded-xl">
            <span className="text-[#FFCB74] font-black text-xs">₹</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-[#FFCB74]/50 font-black uppercase tracking-widest">Cost</span>
            <span className="text-sm font-black text-[#FFCB74] leading-none mt-1">{formatCurrency(route.priceRange.min)} – {formatCurrency(route.priceRange.max)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 md:ml-4">
          <button
            onClick={handleSaveOption}
            className={`p-3.5 rounded-xl transition-all active:scale-95 border ${isBookmarked ? 'bg-[#FFCB74] text-[#111111] border-[#FFCB74]' : 'bg-white/5 text-white/40 border-white/10 hover:bg-[#FFCB74]/10 hover:text-[#FFCB74] hover:border-[#FFCB74]/20'}`}
            title="Bookmark Option"
          >
            {isBookmarked ? <Bookmark size={18} fill="currentColor" /> : <BookmarkPlus size={18} />}
          </button>
        </div>
      </div>

      {showCabBooking && cabSegment && (
        <CabBookingPanel
          fromCoords={cabSegment.fromCoords || { lat: source.lat, lng: source.lng }}
          toCoords={cabSegment.toCoords || { lat: destination.lat, lng: destination.lng }}
          fromName={cabSegment.from || source.name}
          toName={cabSegment.to || destination.name}
          distanceKm={parseFloat(cabSegment.distance) || undefined}
          onClose={() => setShowCabBooking(false)}
        />
      )}

      {showMap && (
        <MapModal segments={segments} onClose={() => setShowMap(false)} />
      )}
    </div>
  )
}
