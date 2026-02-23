import React, { useEffect, useRef, useState } from 'react';
import { X, Navigation, AlertTriangle } from 'lucide-react';

const MapModal = ({ segments, onClose }) => {
    const mapRef = useRef(null);
    const [error, setError] = useState(null);
    const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC3rRX1hit3S23g5f8xNFMnPBhhxp-eBZE';

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    useEffect(() => {
        let isMounted = true;

        const initMap = async () => {
            if (!mapRef.current || !isMounted) return;

            try {
                const { Map } = await window.google.maps.importLibrary("maps");
                const { encoding } = await window.google.maps.importLibrary("geometry");

                let AdvancedMarkerElement, PinElement;
                try {
                    const markerLib = await window.google.maps.importLibrary("marker");
                    AdvancedMarkerElement = markerLib.AdvancedMarkerElement;
                    PinElement = markerLib.PinElement;
                } catch (e) {
                }

                const map = new Map(mapRef.current, {
                    zoom: 12,
                    center: segments[0]?.fromCoords || { lat: 28.6139, lng: 77.2090 },
                    mapId: "4504f990b864231",
                    disableDefaultUI: true,
                    zoomControl: true,
                });

                const bounds = new window.google.maps.LatLngBounds();
                const directionsService = new window.google.maps.DirectionsService();

                const renderRoute = async () => {
                    for (let idx = 0; idx < segments.length; idx++) {
                        const seg = segments[idx];
                        if (!seg.fromCoords || !seg.toCoords) continue;

                        const fromPos = { lat: parseFloat(seg.fromCoords.lat), lng: parseFloat(seg.fromCoords.lng) };
                        const toPos = { lat: parseFloat(seg.toCoords.lat), lng: parseFloat(seg.toCoords.lng) };

                        if (AdvancedMarkerElement && PinElement) {
                            try {
                                const pin = new PinElement({
                                    background: "#FFCB74",
                                    borderColor: "#111111",
                                    glyphText: (idx + 1).toString(),
                                    glyphColor: "#111111",
                                    scale: 0.8
                                });
                                new AdvancedMarkerElement({
                                    position: fromPos,
                                    map,
                                    content: pin,
                                    title: seg.from
                                });

                                if (idx === segments.length - 1) {
                                    const finalPin = new PinElement({
                                        background: "#ffffff",
                                        borderColor: "#111111",
                                        glyphText: "B",
                                        glyphColor: "#111111",
                                        scale: 1.0
                                    });
                                    new AdvancedMarkerElement({ position: toPos, map, content: finalPin, title: seg.to });
                                }
                            } catch (e) {
                            }
                        } else {
                            new window.google.maps.Marker({ position: fromPos, map, label: (idx + 1).toString(), title: seg.from });
                            if (idx === segments.length - 1) {
                                new window.google.maps.Marker({ position: toPos, map, label: 'B', title: seg.to });
                            }
                        }

                        if (seg.polyline) {
                            const path = encoding.decodePath(seg.polyline);
                            new window.google.maps.Polyline({
                                path: path,
                                geodesic: true,
                                strokeColor: seg.mode === 'PLANE' ? '#7db3ff' : '#FFCB74',
                                strokeOpacity: 0.9,
                                strokeWeight: 4,
                                map
                            });
                        } else {
                            const roadModes = ['CAB', 'AUTO', 'BUS', 'WALK', 'BIKE'];
                            if (roadModes.includes(seg.mode)) {
                                directionsService.route({
                                    origin: fromPos,
                                    destination: toPos,
                                    travelMode: window.google.maps.TravelMode.DRIVING
                                }, (result, status) => {
                                    if (status === 'OK' && isMounted) {
                                        new window.google.maps.DirectionsRenderer({
                                            map,
                                            directions: result,
                                            suppressMarkers: true,
                                            polylineOptions: { strokeColor: '#FFCB74', strokeWeight: 5, strokeOpacity: 0.8 }
                                        });
                                    }
                                });
                            } else {
                                new window.google.maps.Polyline({
                                    path: [fromPos, toPos],
                                    geodesic: true,
                                    strokeColor: seg.mode === 'PLANE' ? '#7db3ff' : '#FFCB74',
                                    strokeOpacity: 0.6,
                                    strokeWeight: 3,
                                    map
                                });
                            }
                        }

                        bounds.extend(fromPos);
                        bounds.extend(toPos);
                    }
                    map.fitBounds(bounds);
                };

                renderRoute();

            } catch (err) {
                if (err.message?.includes('ApiNotActivatedMapError')) {
                    setError("Maps API not enabled. Activate in Cloud Console.");
                }
            }
        };

        const loadScript = () => {
            if (window.google?.maps?.importLibrary) {
                initMap();
                return;
            }
            const script = document.createElement('script');
            script.id = 'google-maps-script';
            script.innerHTML = `(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set(['geometry']),e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src="https://maps."+c+"apis.com/maps/api/js?"+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({key: "${GOOGLE_KEY}", v: "weekly"});`;
            document.head.appendChild(script);
            const check = setInterval(() => { if (window.google?.maps?.importLibrary) { clearInterval(check); initMap(); } }, 200);
        };

        loadScript();
        return () => { isMounted = false; };
    }, [segments, GOOGLE_KEY]);

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={onClose}
        >
            {/* Close Button - Outside the card to ensure it's always clickable */}
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose();
                }}
                className="fixed top-8 right-8 z-[10000] p-4 bg-[#1c1c1c] hover:bg-red-500 text-white rounded-full transition-all border-2 border-white/20 shadow-2xl flex items-center justify-center group pointer-events-auto"
                title="Close Map"
            >
                <X size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
            </button>

            <div
                className="relative w-full max-w-5xl h-[85vh] bg-[#1c1c1c] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 left-0 p-6 z-10 bg-gradient-to-r from-[#111111]/80 to-transparent">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Navigation className="text-[#FFCB74]" size={20} />
                        Journey Path
                    </h3>
                </div>

                <div ref={mapRef} className="w-full h-full grayscale-[0.2] contrast-[1.1]" />

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#111111]/90 z-20">
                        <div className="max-w-md p-8 bg-[#1c1c1c] border border-red-500/30 rounded-3xl text-center">
                            <AlertTriangle className="text-orange-500 mx-auto mb-4" size={48} />
                            <h4 className="text-white font-bold mb-2">Maps Error</h4>
                            <p className="text-white/60 text-sm mb-6">{error}</p>
                            <button onClick={() => window.open('https://console.cloud.google.com/google/maps-apis/library', '_blank')} className="px-8 py-3 bg-[#FFCB74] text-[#111111] rounded-xl font-bold text-xs">Enable API</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default MapModal;
