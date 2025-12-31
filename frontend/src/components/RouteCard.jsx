export function RouteCard({ route }) {
  return (
    <div className="bg-[#2f2f2f] rounded-2xl p-[1.5rem] w-[26rem]">
      
      {/* MODES LIST */}
      <div className="flex flex-col gap-3">
        {route.modes.map((mode, index) => (
          <div
            key={index}
            className="bg-[#1c1c1c] rounded-xl px-4 py-3 flex items-center gap-3"
          >
            {/* MODE ICON SVG HERE */}
            {/* 👉 paste SVG for {mode} */}

            <div className="flex-1">
              <p className="font-medium">{mode}</p>
              {/* STOP NAME / DETAILS (optional future) */}
            </div>

            {/* TIME + PRICE SMALL PILL */}
            <div className="text-xs bg-black px-3 py-1 rounded-full">
              {/* example */}
              {route.totalTime} min
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM SUMMARY BAR */}
      <div className="bg-[#FFCB74] text-[#111111] rounded-xl mt-4 px-4 py-3 flex justify-between text-sm">
        <span>{route.totalTime} min</span>
        <span>₹{route.priceRange.min}–{route.priceRange.max}</span>
        <span>{route.modes.length - 1} Transfers</span>
      </div>

      {/* BADGE */}
      {route.tag && (
        <div className="mt-3">
          <span className="bg-[#b7e28b] text-[#111111] px-4 py-1 rounded-full text-sm">
            {route.tag}
          </span>
        </div>
      )}
    </div>
  );
}
