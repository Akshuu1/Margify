import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getRoutes } from "../services/routeApi";
import { BadgeBar } from "../components/BadgeBar";
import { RouteCard } from "../components/RouteCard";
import WeatherWidget from "../components/WeatherWidget";
import { TouristPlaces } from "../components/TouristPlaces";
import { saveRoute } from "../services/savedRoutesApi";
import { Bookmark, BookmarkCheck } from "lucide-react";

export function RoutesPage() {
  const location = useLocation();
  const { source, destination } = location.state || {};

  const [routes, setRoutes] = useState([]);
  const [distance, setDistance] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [showTouristPlaces, setShowTouristPlaces] = useState(false);
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
        setRoutes(data.routes || []);
        setDistance(data.distanceKm);
        setWeather(data.weather);
        setAlerts(data.alerts || []);
        setTouristPlaces(data.touristPlaces || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRoutes();
  }, [source, destination]);

  const handleSaveRoute = async () => {
    if (isSaved) {
      console.log('Route already saved');
      return;
    }

    console.log('Attempting to save route:', { source, destination });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to save routes');
        return;
      }

      const result = await saveRoute({
        routeName: `${source.name} to ${destination.name}`,
        source: {
          address: source.name,
          coordinates: { lat: source.lat, lng: source.lng }
        },
        destination: {
          address: destination.name,
          coordinates: { lat: destination.lat, lng: destination.lng }
        },
        preferences: { routeType: 'fastest' }
      });

      console.log('Route saved successfully:', result);
      setIsSaved(true);
      alert('✓ Search saved successfully! Find it in Saved Routes.');
    } catch (error) {
      console.error('Failed to save route:', error);
      console.error('Error details:', error.response?.data || error.message);

      const errorMsg = error.response?.data?.message || error.message || 'Failed to save route';
      alert('✗ ' + errorMsg);
    }
  };

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
    <div className="w-screen h-screen flex flex-col text-[#e0e0e0] overflow-hidden" style={{ fontFamily: "Space Grotesk" }}>
      <div className="px-4.sm:px-6 md:px-12 lg:px-16 py-6 flex-shrink-0">
        <h1 className="text-3xl font-[Kiona-Regular] sm:text-4xl md:text-5xl lg:text-[4rem] text-center mb-6 font-bold tracking-tight">Margify</h1>

        <div className="bg-[#FFCB74] rounded-2xl p-4 text-[#111111] shadow-xl">
          <div className="flex flex-col xl:flex-row items-center gap-4 xl:gap-8">

            {/* Route Info Section - Takes more space */}
            <div className="w-full xl:flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-4">
              {/* Source */}
              <div className="flex-1 bg-[#2f2f2f] text-[#e0e0e0] px-6 py-4 rounded-xl text-center shadow-inner min-w-[200px] flex items-center justify-center">
                <span className="truncate font-medium text-lg">{source.name}</span>
              </div>

              {/* Arrow / Info */}
              <div className="flex flex-col items-center gap-1 shrink-0 px-2 justify-center">
                <div className="hidden md:flex items-center gap-2 text-sm font-bold opacity-80 whitespace-nowrap">
                  <span>{routes.length} ROUTES</span>
                </div>
                <div className="flex items-center text-[#111111]">
                  <div className="h-[2px] w-8 md:w-24 bg-current"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="m12 5 7 7-7 7" /><path d="M19 12H5" /></svg>
                  <div className="h-[2px] w-8 md:w-24 bg-current"></div>
                </div>
              </div>

              {/* Destination */}
              <div className="flex-1 bg-[#2f2f2f] text-[#e0e0e0] px-6 py-4 rounded-xl text-center shadow-inner min-w-[200px] flex items-center justify-center">
                <span className="truncate font-medium text-lg">{destination.name}</span>
              </div>
            </div>

            {/* Actions Section - Fixed width or flex wrap */}
            <div className="w-full xl:w-auto flex flex-wrap items-center justify-center xl:justify-end gap-3 shrink-0">
              <button
                onClick={() => window.location.href = '/search'}
                className="flex-1 sm:flex-none px-5 py-3 bg-[#1c1c1c] rounded-xl hover:bg-[#2f2f2f] transition-all text-[#e0e0e0] font-bold flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap min-w-[120px]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" /></svg>
                <span>Change</span>
              </button>

              {touristPlaces.length > 0 && (
                <button
                  onClick={() => setShowTouristPlaces(!showTouristPlaces)}
                  className={`flex-1 sm:flex-none px-5 py-3 rounded-xl transition-all font-bold flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap min-w-[140px] ${showTouristPlaces
                    ? 'bg-[#111111] text-[#FFCB74]'
                    : 'bg-[#1c1c1c] text-[#e0e0e0] hover:bg-[#2f2f2f]'
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Tourist Places</span>
                </button>
              )}

              <button
                onClick={handleSaveRoute}
                disabled={isSaved}
                className={`flex-1 sm:flex-none px-5 py-3 rounded-xl transition-all font-bold flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap min-w-[100px] ${isSaved
                  ? 'bg-[#1c1c1c] text-green-400 cursor-not-allowed'
                  : 'bg-[#1c1c1c] text-[#e0e0e0] hover:bg-[#2f2f2f]'
                  }`}
              >
                {isSaved ? <BookmarkCheck className="text-green-400" size={18} /> : <Bookmark size={18} />}
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>


      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-12 lg:px-16 pb-8 sm:pb-12 md:pb-16 scroll-smooth">
        <div className="flex flex-col gap-3 sm:gap-4">
          {weather && (
            <div className="w-full">
              <WeatherWidget weather={weather} />
            </div>
          )}

          {alerts.length > 0 && alerts.map((alert, idx) => (
            <div key={idx} className="bg-orange-500/20 border border-orange-500/30 p-3 sm:p-4 rounded-2xl flex items-start gap-3 sm:gap-4 w-full text-orange-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 flex-shrink-0 mt-1"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
              <p className="text-xs sm:text-sm">{alert.message}</p>
            </div>
          ))}

          <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 mt-2">
            {routes.map((route) => (
              <RouteCard key={route.id} route={route} source={source} destination={destination} />
            ))}
          </div>
        </div>
      </div>

      {/* Tourist Places as Centered Popup */}
      {
        showTouristPlaces && touristPlaces.length > 0 && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTouristPlaces(false)}
          >
            <div
              className="bg-[#1c1c1c] rounded-2xl max-w-6xl w-full max-h-[85vh] overflow-hidden border border-[#FFCB74]/30 shadow-2xl shadow-[#FFCB74]/20"
              onClick={(e) => e.stopPropagation()}
            >
              <TouristPlaces places={touristPlaces} onClose={() => setShowTouristPlaces(false)} />
            </div>
          </div>
        )
      }
    </div >
  );
}
