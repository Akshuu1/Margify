import React, { useEffect, useRef } from 'react';
import { X, Navigation } from 'lucide-react';

const MAP_V = "v3.1"; // Internal version for debugging

const MapModal = ({ segments, onClose }) => {
    const mapRef = useRef(null);
    const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC3rRX1hit3S23g5f8xNFMnPBhhxp-eBZE';

    useEffect(() => {
        let isMounted = true;

        console.log(`[MapModal ${MAP_V}] Initializing map for ${segments.length} segments`);

        const initMap = () => {
            if (!mapRef.current || !isMounted) return;

            // Wait for window.google.maps to be ready
            if (!window.google || !window.google.maps || !window.google.maps.Map) {
                console.log(`[MapModal] Maps not fully loaded yet, waiting...`);
                setTimeout(initMap, 200);
                return;
            }

            try {
                // FORCE USE OF CONSTRUCTORS - NO importLibrary
                const { Map, Marker, Polyline, LatLng, LatLngBounds } = window.google.maps;

                const map = new Map(mapRef.current, {
                    zoom: 12,
                    center: segments[0]?.fromCoords || { lat: 28.6139, lng: 77.2090 },
                    styles: [
                        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                        { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
                        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
                        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
                        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
                        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] }
                    ],
                    disableDefaultUI: true,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false
                });

                const bounds = new LatLngBounds();
                const pathCoordinates = [];

                // ABSOLUTE FALLBACK: If segments somehow lost coordinates, use global context
                const validSegments = segments.filter(s => s.fromCoords && s.toCoords);

                if (validSegments.length === 0) {
                    console.warn(`[MapModal] No segment coordinates found. Using route-level fallbacks.`);
                    // Even if segments are empty, try to show the map area
                    const fbFrom = segments[0]?.fromCoords || { lat: 28.6139, lng: 77.2090 };
                    const fbTo = segments[segments.length - 1]?.toCoords || { lat: 28.5355, lng: 77.3910 };
                    bounds.extend(fbFrom);
                    bounds.extend(fbTo);
                } else {
                    validSegments.forEach((seg, idx) => {
                        const fromPos = new LatLng(seg.fromCoords.lat, seg.fromCoords.lng);
                        const toPos = new LatLng(seg.toCoords.lat, seg.toCoords.lng);

                        pathCoordinates.push(fromPos);
                        if (idx === validSegments.length - 1) pathCoordinates.push(toPos);

                        new Marker({
                            position: fromPos,
                            map,
                            title: seg.from,
                            label: { text: (idx + 1).toString(), color: 'white' }
                        });

                        bounds.extend(fromPos);
                        bounds.extend(toPos);
                    });

                    new Polyline({
                        path: pathCoordinates,
                        geodesic: true,
                        strokeColor: '#FFCB74',
                        strokeOpacity: 0.8,
                        strokeWeight: 4,
                        map: map
                    });
                }

                map.fitBounds(bounds);
                console.log(`[MapModal] Map successfully rendered. Fallback used: ${validSegments.length === 0}`);
            } catch (err) {
                console.error("[MapModal] Render Error:", err);
            }
        };

        const loadScript = () => {
            if (window.google?.maps?.Map) {
                initMap();
                return;
            }

            const existing = document.getElementById('google-maps-script');
            if (existing) {
                existing.addEventListener('load', initMap);
                return;
            }

            const script = document.createElement('script');
            script.id = 'google-maps-script';
            // PURE LEGACY SRC - NO BORDERLINE FEATURES
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}`;
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            script.onerror = () => console.error("[MapModal] Failed to load Google Maps script");
            document.head.appendChild(script);
        };

        loadScript();

        return () => { isMounted = false; };
    }, [segments, GOOGLE_KEY]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-5xl h-[80vh] bg-[#1c1c1c] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-[#111111]/80 to-transparent">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Navigation className="text-[#FFCB74]" size={20} />
                            Journey Route
                        </h3>
                        <p className="text-xs text-white/60">{segments.length} segments visualized • {MAP_V}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-black/40 hover:bg-red-500/80 rounded-full transition-all text-white backdrop-blur-md border border-white/10"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Map Container */}
                <div ref={mapRef} className="w-full h-full grayscale-[0.2] contrast-[1.1]" />

                {/* Footer Info */}
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-2xl z-10 flex items-center justify-between pointer-events-none">
                    <div className="flex gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-[#FFCB74] font-bold">From</span>
                            <span className="text-sm font-medium text-white">{segments[0]?.from}</span>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10 self-center"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-[#FFCB74] font-bold">To</span>
                            <span className="text-sm font-medium text-white">{segments[segments.length - 1]?.to}</span>
                        </div>
                    </div>
                    <div className="text-[#FFCB74] font-bold text-lg px-4 flex items-center gap-2">
                        <span className="text-white/40 text-xs font-normal">Est. Distance</span>
                        {segments.reduce((acc, s) => acc + parseFloat(s.distance || 0), 0).toFixed(1)} km
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapModal;
