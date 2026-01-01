import { TimelineSegment } from "./TimelineSegment"
import { formatDuration, formatCurrency } from "../utils/format"

export function RouteCard({ route }) {
  const segments = route.segments || []

  
  const TAG_STYLES = {
    Cheapest: "bg-[#b7e28b] text-[#111111]",
    Fastest: "bg-[#7db3ff] text-[#111111]",
    Best: "bg-[#FFCB74] text-[#111111]",
    Luxury: "bg-[#d6a8ff] text-[#111111]",
  }

  const tagClass =
    TAG_STYLES[route.tag] || "bg-[#2f2f2f] text-[#e0e0e0]"

  return (
    <div className="bg-[#2f2f2f] rounded-2xl p-[1.5rem] w-[93.6vw] max-w-[93.6vw] flex flex-col justify-between h-auto">
      <div className="flex justify-between items-center mb-4">
        {route.tag && (
          <span className={`${tagClass} px-4 py-1 rounded-full text-sm font-medium`}>
            {route.tag}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 flex-1">
        {segments.map((segment, index) => (
          <TimelineSegment key={index} segment={segment} isLast={index === segments.length - 1}/>
        ))}
      </div>
      <div className="bg-[#FFCB74] text-[#111111] rounded-xl mt-6 px-4 py-3 flex justify-between items-center text-sm font-medium">
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2m3.3 14.71L11 12.41V7h2v4.59l3.71 3.71z" /></svg>
          {formatDuration(route.totalTime)}
        </div>
        <div className="flex items-center gap-1 border-l border-black/20 pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5" />
          </svg>
          {segments.reduce((acc, curr) => acc + parseFloat(curr.distance), 0).toFixed(1)}{" "}
          km
        </div>
        <div className="flex items-center gap-1 border-l border-black/20 pl-3">
          {formatCurrency(route.priceRange.min)} – {route.priceRange.max}
        </div>
        <div className="flex items-center gap-1 border-l border-black/20 pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3M21 9l-3.99-4v3H10v2h7.01v3L21 9" />
          </svg>
          {route.transfers} Transfers
        </div>

      </div>
    </div>
  )
}
