export function BadgeBar({ routes }) {
  const cheapest = routes.find(r => r.tag === "Cheapest");
  const fastest = routes.find(r => r.tag === "Fastest");
  const best = routes.find(r => r.tag === "Best");
  const luxury = routes.find(r =>
    r.modes.includes("CAB") || r.modes.includes("PLANE")
  );

  return (
    <div className="flex gap-4">
      {cheapest && (
        <span className="bg-[#b7e28b] text-[#111111] px-4 py-2 rounded-full">
          Cheapest
        </span>
      )}
      {fastest && (
        <span className="bg-[#7db3ff] text-[#111111] px-4 py-2 rounded-full">
          Fastest
        </span>
      )}
      {best && (
        <span className="bg-[#FFCB74] text-[#111111] px-4 py-2 rounded-full">
          Best
        </span>
      )}
      {luxury && (
        <span className="bg-[#d6a8ff] text-[#111111] px-4 py-2 rounded-full">
          Luxury
        </span>
      )}
    </div>
  );
}
