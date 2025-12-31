import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getRoutes } from "../services/routeApi";
import { BadgeBar } from "../components/BadgeBar";
import { RouteCard } from "../components/RouteCard";

export function RoutesPage() {
  const location = useLocation();
  const { source, destination } = location.state || {};

  const [routes, setRoutes] = useState([]);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!source || !destination) {
      setLoading(false);
      return;
    }

    async function fetchRoutes() {
      try {
        const data = await getRoutes(
          source,
          destination,
          localStorage.getItem("token")
        );
        setRoutes(data.routes || []);
        setDistance(data.distanceKm);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRoutes();
  }, [source, destination]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center text-[#e0e0e0]">
        Finding routes...
      </div>
    );
  }

  if (!source || !destination) {
    return (
      <div className="w-screen h-screen flex justify-center items-center text-[#e0e0e0]">
        No route data found.
      </div>
    );
  }

  return (
    <div
      className="w-screen h-screen text-[#e0e0e0] px-[3rem]"
      style={{ fontFamily: "Space Grotesk", background: "#111111" }}
    >
      {/* TITLE */}
      <h1 className="text-[6rem] text-center mb-[2rem]">Margify</h1>

      {/* HEADER BAR */}
      <div className="bg-[#FFCB74] rounded-2xl p-[2rem] flex items-center justify-between text-[#111111]">
        <div className="bg-[#2f2f2f] text-[#e0e0e0] px-[2rem] py-[1rem] rounded-xl">
          {source.name}
        </div>

        <div className="flex items-center gap-4">
          <span>Found {routes.length} routes</span>
          {/* ARROW SVG HERE */}
          {/* 👉 paste arrow svg */}
        </div>

        <div className="bg-[#2f2f2f] text-[#e0e0e0] px-[2rem] py-[1rem] rounded-xl">
          {destination.name}
        </div>
      </div>

      {/* BADGES */}
      <div className="mt-[2rem]">
        <BadgeBar routes={routes} />
      </div>

      {/* ROUTES LIST */}
      <div className="mt-[2rem] flex gap-[3rem]">
        <div className="flex flex-col gap-[1.5rem]">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      </div>
    </div>
  );
}
