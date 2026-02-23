import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getRoutes } from "../services/routeApi";
import { BadgeBar } from "../components/BadgeBar";
import { RouteCard } from "../components/RouteCard";
import WeatherWidget from "../components/WeatherWidget";
import { TouristPlaces } from "../components/TouristPlaces";
import { FoodHubs } from "../components/FoodHubs";
import { saveRoute } from "../services/savedRoutesApi";
import { Bookmark, BookmarkCheck, BarChart3, Map as MapIcon, Utensils, MapPin, Cloudy, Sparkles } from "lucide-react";
import { DiscoveryHub } from "../components/DiscoveryHub";
import SavingsDashboard from "../components/SavingsDashboard";
export function RoutesPage() {
  const location = useLocation();
  const { source, destination } = location.state || {};
  const [routes, setRoutes] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [showTouristPlaces, setShowTouristPlaces] = useState(false);
  const [hubPitStops, setHubPitStops] = useState(null);
  const [showFoodHubs, setShowFoodHubs] = useState(false);
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    if (!source || !destination) {
      setLoading(false);
      return;
    }
    async function fetchRoutes() {
      setLoading(true);
      try {
        const data = await getRoutes(
          source,
          destination,
          localStorage.getItem("token"),
          {}
        );
        let sortedRoutes = data.routes || [];

        // Apply user's default mode preference
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          const { defaultMode } = JSON.parse(savedSettings);
          if (defaultMode === 'Metro First') {
            sortedRoutes.sort((a, b) => {
              const aHasMetro = a.modes?.some(m => m === 'METRO' || m === 'TRAIN') ? 0 : 1;
              const bHasMetro = b.modes?.some(m => m === 'METRO' || m === 'TRAIN') ? 0 : 1;
              if (aHasMetro !== bHasMetro) return aHasMetro - bHasMetro;
              return a.totalTime - b.totalTime;
            });
          } else if (defaultMode === 'Fastest Only') {
            sortedRoutes.sort((a, b) => a.totalTime - b.totalTime);
          } else if (defaultMode === 'Budget Priority') {
            sortedRoutes.sort((a, b) => (a.priceRange?.min || 0) - (b.priceRange?.min || 0));
          }
        }

        setRoutes(sortedRoutes);
        setWeather(data.weather);
        setAlerts(data.alerts || []);
        setTouristPlaces(data.touristPlaces || []);
        setHubPitStops(data.hubPitStops || null);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    fetchRoutes();
  }, [source, destination]);
  const handleSaveRoute = async () => {
    if (isSaved) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) { alert('Please login to save routes'); return; }
      await saveRoute({
        routeName: `${source.name} to ${destination.name}`,
        source: { address: source.name, coordinates: { lat: source.lat, lng: source.lng } },
        destination: { address: destination.name, coordinates: { lat: destination.lat, lng: destination.lng } },
        preferences: { routeType: 'fastest' }
      });
      setIsSaved(true);
      alert('✓ Search saved successfully!');
    } catch (error) {
      alert('✗ Failed to save route');
    }
  };
  if (loading) return <div className="w-screen h-screen flex justify-center items-center text-[#e0e0e0] font-[Space Grotesk]">Finding routes...</div>;
  if (!source || !destination) return <div className="w-screen h-screen flex justify-center items-center text-[#e0e0e0] font-[Space Grotesk]">No route data found.</div>;
  return (
    <div className="w-screen h-screen flex flex-col text-[#e0e0e0] overflow-hidden" style={{ fontFamily: "Space Grotesk" }}>
      <div className="px-4 py-4 sm:px-6 md:px-12 lg:px-16 sm:py-6 flex-shrink-0">
        <h1 className="text-4xl sm:text-5xl lg:text-[4rem] text-center mb-6 font-[Kiona-Regular] tracking-tight">Margify</h1>
        <div className="bg-[#FFCB74] rounded-2xl p-4 text-[#111111] shadow-xl">
          <div className="flex flex-col xl:flex-row items-center gap-4 xl:gap-8">
            <div className="w-full xl:flex-1 flex flex-col md:flex-row items-center gap-3">
              <div className="flex-1 w-full bg-[#2f2f2f] text-[#e0e0e0] px-5 py-3 rounded-xl text-center shadow-inner font-medium text-sm md:text-base border border-white/5 truncate">{source.name}</div>
              <div className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">TO</div>
              <div className="flex-1 w-full bg-[#2f2f2f] text-[#e0e0e0] px-5 py-3 rounded-xl text-center shadow-inner font-medium text-sm md:text-base border border-white/5 truncate">{destination.name}</div>
            </div>
            <div className="flex gap-2 w-full xl:w-auto">
              <button onClick={() => window.location.href = '/search'} className="flex-1 xl:flex-none px-4 py-3 bg-[#111111] text-white rounded-xl font-bold flex items-center justify-center gap-2 text-xs transition-transform active:scale-95">Change Route</button>
              <button onClick={handleSaveRoute} disabled={isSaved} className={`flex-1 xl:flex-none px-4 py-3 bg-[#111111] rounded-xl font-bold flex items-center justify-center gap-2 text-xs transition-all ${isSaved ? 'text-green-400' : 'text-white'}`}>
                {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-12 lg:px-16 pb-12 scroll-smooth">
        <DiscoveryHub weather={weather} touristPlaces={touristPlaces} hubPitStops={hubPitStops} onShowTourist={() => setShowTouristPlaces(true)} onShowFood={() => setShowFoodHubs(true)} />
        {alerts.length > 0 && alerts.map((alert, idx) => (
          <div key={idx} className="mb-6 bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-start gap-4 text-orange-200/80">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
            <p className="text-sm leading-relaxed">{alert.message}</p>
          </div>
        ))}
        {routes.length > 1 && <SavingsDashboard routes={routes} />}
        <div className="flex flex-col gap-6 mt-4">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} source={source} destination={destination} hubPitStops={hubPitStops} />
          ))}
        </div>
      </div>
      {showTouristPlaces && touristPlaces.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setShowTouristPlaces(false)}>
          <div className="bg-[#1c1c1c] rounded-3xl max-w-6xl w-full max-h-[85vh] overflow-hidden border border-indigo-500/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <TouristPlaces places={touristPlaces} onClose={() => setShowTouristPlaces(false)} />
          </div>
        </div>
      )}
      {showFoodHubs && hubPitStops && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setShowFoodHubs(false)}>
          <div className="bg-[#1c1c1c] rounded-3xl max-w-6xl w-full max-h-[85vh] overflow-hidden border border-orange-500/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <FoodHubs hubStops={hubPitStops} onClose={() => setShowFoodHubs(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
