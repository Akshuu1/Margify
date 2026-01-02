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
    <div className="w-screen h-screen text-[#e0e0e0] px-[3rem] flex flex-col " style={{ fontFamily: "Space Grotesk" }}>
      <h1 className="text-[4rem] text-center mb-[2rem]">Margify</h1>
      <div className="bg-[#FFCB74] rounded-2xl p-[1rem] flex items-center justify-between text-[#111111]">
        <div className="bg-[#2f2f2f] text-center w-1/3 text-[#e0e0e0] px-[2rem] py-[1rem] rounded-xl">
          {source.name}
        </div>
        <div className="flex items-center gap-4">
        <div className="w-[10rem] h-[3px] bg-[#111111]"></div>
          <span>Found {routes.length} routes</span>
          <div className="flex items-center ">
          <div className="h-[3px] w-[6rem] bg-[#111111]"></div>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M0 12H14M9 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/></svg>
          </div>
        </div>
        <div className="bg-[#2f2f2f] text-center w-1/3 text-[#e0e0e0] px-[2rem] py-[1rem] rounded-xl">
          {destination.name}
        </div>
      </div>
      <div className="mt-[2rem] flex gap-[3rem] h-full overflow-y-scroll pb-[10rem]">
        <div className="flex flex-col gap-[1.5rem] max-w-4xl">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      </div>
    </div>
  );
}
