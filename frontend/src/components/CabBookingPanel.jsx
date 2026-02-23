import { useState, useEffect } from 'react';
import { getCabPrices } from '../services/cabApi';
import { Car, Clock, TrendingUp, ExternalLink, Loader2, X, Zap } from 'lucide-react';

/**
 * CabBookingPanel — Slide-up panel showing cab price comparison.
 * Shows Uber, Ola, Rapido options with live-ish pricing & deep links.
 * 
 * Props:
 *   fromCoords: { lat, lng }
 *   toCoords: { lat, lng }
 *   fromName: string
 *   toName: string
 *   distanceKm: number (optional)
 *   onClose: () => void
 */
export default function CabBookingPanel({ fromCoords, toCoords, fromName, toName, distanceKm, onClose }) {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!fromCoords?.lat || !toCoords?.lat) {
            setError(true);
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function fetchPrices() {
            setLoading(true);
            setError(false);
            try {
                const data = await getCabPrices(
                    fromCoords.lat, fromCoords.lng,
                    toCoords.lat, toCoords.lng,
                    distanceKm,
                    fromName, toName
                );
                if (!cancelled) {
                    setPrices(data);
                    setError(data.length === 0);
                }
            } catch {
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchPrices();
        return () => { cancelled = true; };
    }, [fromCoords, toCoords, distanceKm, fromName, toName]);

    /**
     * Try to open the cab app via deep link.
     * Fallback chain: app:// → web URL → Google Maps
     */
    const handleBookNow = (cab) => {
        const { deepLinks } = cab;
        if (!deepLinks) {
            console.error('No deep links for cab:', cab);
            return;
        }

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile && deepLinks.app) {
            // Mobile: Try App URI
            console.log('Attempting app redirect:', deepLinks.app);
            const start = Date.now();
            window.location.assign(deepLinks.app);

            // Fallback to web/maps if app doesn't open within 2s
            setTimeout(() => {
                if (Date.now() - start < 2500) {
                    console.log('App redirect failed or timed out, opening web/fallback');
                    window.open(deepLinks.web || deepLinks.fallback, '_blank');
                }
            }, 2000);
        } else {
            // Desktop or no app link: Use Web link
            const target = deepLinks.web || deepLinks.fallback;
            console.log('Desktop/Web redirect to:', target);
            window.open(target, '_blank');
        }
    };

    const providerLogos = {
        uber: { bg: 'from-[#276EF1]/20 to-[#276EF1]/5', border: 'border-[#276EF1]/30', text: 'text-[#276EF1]' },
        ola: { bg: 'from-[#68B64F]/20 to-[#68B64F]/5', border: 'border-[#68B64F]/30', text: 'text-[#68B64F]' },
        rapido: { bg: 'from-[#FFD500]/20 to-[#FFD500]/5', border: 'border-[#FFD500]/30', text: 'text-[#FFD500]' },
    };

    return (
        <div className="mt-4 bg-gradient-to-br from-[#1a1a1a] to-[#111] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FFCB74]/20 rounded-xl">
                        <Car size={16} className="text-[#FFCB74]" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">Book a Ride</h4>
                        <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Compare & book instantly</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={16} className="text-white/40" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8 gap-3">
                        <Loader2 size={20} className="text-[#FFCB74] animate-spin" />
                        <span className="text-sm text-white/40 font-medium">Fetching live prices...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-6">
                        <p className="text-white/40 text-sm mb-2">Prices unavailable right now</p>
                        <button
                            onClick={() => {
                                const fallback = `https://www.google.com/maps/dir/?api=1&origin=${fromCoords.lat},${fromCoords.lng}&destination=${toCoords.lat},${toCoords.lng}&travelmode=driving`;
                                window.open(fallback, '_blank');
                            }}
                            className="text-xs text-[#FFCB74] font-bold underline"
                        >
                            Open in Google Maps →
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Surge indicator */}
                        {prices[0]?.surge > 1.0 && (
                            <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                                <TrendingUp size={14} className="text-orange-400" />
                                <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                                    {prices[0].surgeLabel} • {Math.round((prices[0].surge - 1) * 100)}% above normal
                                </span>
                            </div>
                        )}

                        {/* Cab options */}
                        <div className="space-y-2.5">
                            {prices.map((cab) => {
                                const style = providerLogos[cab.provider] || providerLogos.uber;
                                return (
                                    <button
                                        key={cab.id}
                                        type="button"
                                        className={`w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${style.bg} border ${style.border} hover:scale-[1.02] transition-all cursor-pointer group active:scale-[0.98] outline-none text-left`}
                                        onClick={() => handleBookNow(cab)}
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <span className="text-2xl">{cab.icon}</span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-white">{cab.name}</span>
                                                    {cab === prices[0] && (
                                                        <span className="text-[8px] font-black uppercase bg-[#FFCB74] text-black px-1.5 py-0.5 rounded tracking-wider">Cheapest</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className="text-[10px] text-white/40 flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {cab.eta} min away
                                                    </span>
                                                    <span className="text-[10px] text-white/40">
                                                        ~{cab.travelTime} min ride
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-sm font-black text-white">₹{cab.price.min}</div>
                                                {cab.price.max > cab.price.min && (
                                                    <div className="text-[9px] text-white/30">– ₹{cab.price.max}</div>
                                                )}
                                            </div>
                                            <div className="px-3 py-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all flex items-center gap-1.5 shadow-sm">
                                                <span className={`text-[10px] font-black uppercase tracking-wider ${style.text}`}>Book</span>
                                                <ExternalLink size={12} className={style.text} />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="mt-3 flex items-center justify-between px-1">
                            <span className="text-[9px] text-white/20 font-medium">
                                Estimated prices • Actual may vary
                            </span>
                            <div className="flex items-center gap-1 text-[9px] text-[#FFCB74]/40">
                                <Zap size={10} />
                                <span className="font-bold uppercase tracking-wider">Powered by Margify</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
