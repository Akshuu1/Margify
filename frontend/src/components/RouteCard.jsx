import { TimelineSegment } from "./TimelineSegment";
import { formatDuration, formatCurrency } from "../utils/format";

export function RouteCard({ route }) {
  const segments = route.segments || [];

  return (
    <div className="bg-[#2f2f2f] rounded-2xl p-[1.5rem] w-[93.6vw] max-w-[93.6vw]  flex flex-col justify-between h-auto ">
      <div className="flex justify-between items-center mb-4">
        {route.tag && (
          <span className="bg-[#b7e28b] text-[#111111] px-4 py-1 rounded-full text-sm font-medium">
            {route.tag}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 flex-1">
        {segments.map((segment, index) => (
          <TimelineSegment
            key={index}
            segment={segment}
            isLast={index === segments.length - 1} />
        ))}
      </div>

      {/* BOTTOM SUMMARY BAR */}
      <div className="bg-[#FFCB74] text-[#111111] rounded-xl mt-6 px-4 py-3 flex justify-between items-center text-sm font-medium">
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2m3.3 14.71L11 12.41V7h2v4.59l3.71 3.71z" /></svg>
          {formatDuration(route.totalTime)}
        </div>

        {/* Distance? Backend sends total distance in root? passed to card? 
            Route object has 'distanceKm' on root? No, route array item doesn't have it generally. 
            We can sum segments distance or just pass it if available. 
            Let's assume we pass it or calculate it.
            Actually backend sends `distanceKm` at top level response, not in each route object usually.
            But we updated controller to return everything inside route object? 
            Checking controller... 
            Ah, controller calculates everything per route but `distanceKm` is mostly global.
            However, we can calculate from segments.
        */}
        <div className="flex items-center gap-1 border-l border-black/20 pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5" /></svg>
          {segments.reduce((acc, curr) => acc + parseFloat(curr.distance), 0).toFixed(1)} km
        </div>

        <div className="flex items-center gap-1 border-l border-black/20 pl-3">
          <span>{formatCurrency(route.priceRange.min)}-{route.priceRange.max}</span>
        </div>

        <div className="flex items-center gap-1 border-l border-black/20 pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3M21 9l-3.99-4v3H10v2h7.01v3L21 9" /></svg>
          {route.transfers} Transfers
        </div>
      </div>
    </div>
  );
}
