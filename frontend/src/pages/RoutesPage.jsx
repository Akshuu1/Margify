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
          {} // Accessibility preferences removed
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
  }, [source, destination]); // Removed accessibility dependencies

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
      {/* Fixed Header - Responsive */}
      <div className="px-4 sm:px-6 md:px-12 lg:px-16 py-4 sm:py-6 md:py-8 flex-shrink-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] text-center mb-4 sm:mb-6 md:mb-8">Margify</h1>
        <div className="bg-[#FFCB74] rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between text-[#111111] gap-3 sm:gap-0">
          <div className="bg-[#2f2f2f] text-center w-full sm:w-1/3 text-[#e0e0e0] px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base truncate">
            {source.name}
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm md:text-base">
            <div className="hidden sm:block w-8 md:w-[10rem] h-[2px] md:h-[3px] bg-[#111111]"></div>
            <span className="whitespace-nowrap">Found {routes.length} routes</span>
            <div className="flex items-center">
              <div className="h-[2px] md:h-[3px] w-4 md:w-[6rem] bg-[#111111]"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 12H14M9 7l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" /></svg>
            </div>
          </div>
          <div className="bg-[#2f2f2f] text-center w-full sm:w-1/3 text-[#e0e0e0] px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base truncate">
            {destination.name}
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <button
              onClick={() => window.location.href = '/search'}
              className="px-3 sm:px-4 py-2 sm:py-3 bg-[#2f2f2f] rounded-xl hover:bg-[#3f3f3f] transition-colors text-[#e0e0e0] font-medium flex items-center gap-2 text-xs sm:text-sm"
              title="Change locations"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"></polyline>
                <polyline points="23 20 23 14 17 14"></polyline>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
              </svg>
              <span className="hidden md:inline">Change</span>
            </button>
            {touristPlaces.length > 0 && (
              <button
                onClick={() => setShowTouristPlaces(!showTouristPlaces)}
                className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all font-medium flex items-center gap-2 text-xs sm:text-sm ${showTouristPlaces
                  ? 'bg-[#111111] text-[#FFCB74]'
                  : 'bg-[#2f2f2f] text-[#e0e0e0] hover:bg-[#3f3f3f]'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="hidden sm:inline">Tourist Places ({touristPlaces.length})</span>
                <span className="sm:hidden">Places ({touristPlaces.length})</span>
              </button>
            )}
            <button
              onClick={handleSaveRoute}
              disabled={isSaved}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-colors font-medium flex items-center gap-2 text-xs sm:text-sm ${isSaved
                ? 'bg-[#1c1c1c] text-green-400 cursor-not-allowed'
                : 'bg-[#2f2f2f] text-[#e0e0e0] hover:bg-[#3f3f3f]'
                }`}
              title={isSaved ? "Route saved" : "Save this search"}
            >
              {isSaved ? <BookmarkCheck className="text-green-400" size={16} /> : <Bookmark size={16} />}
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content - Fully Responsive */}
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
      {showTouristPlaces && touristPlaces.length > 0 && (
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
      )}
    </div>
  );
}
