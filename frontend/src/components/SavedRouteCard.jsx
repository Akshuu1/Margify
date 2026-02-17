import React from 'react';
import { MapPin, Navigation, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SavedRouteCard = ({ route, onDelete, onEdit }) => {
    const navigate = useNavigate();

    const handleQuickPlan = () => {
        navigate('/routes', {
            state: {
                from: route.source,
                to: route.destination,
                quickPlan: true
            }
        });
    };

    return (
        <div className="bg-[#1c1c1c] backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-[#FFCB74]/30 transition-all duration-500 group relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <Navigation size={64} className="text-white rotate-12" />
            </div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-xl font-bold text-white group-hover:text-[#FFCB74] transition-colors leading-tight">
                    {route.routeName}
                </h3>
                <span className="text-[10px] font-black text-[#FFCB74] bg-[#FFCB74]/10 px-2 py-1 rounded-lg uppercase tracking-widest border border-[#FFCB74]/20">
                    {route.usageCount || 0} TRIPS
                </span>
            </div>

            <div className="space-y-4 mb-6 relative z-10">
                <div className="flex items-start gap-4">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"></div>
                    <p className="text-sm text-white/50 font-medium line-clamp-1">{route.source?.address || route.source?.name}</p>
                </div>

                <div className="h-4 ml-[2px] border-l border-dashed border-white/10"></div>

                <div className="flex items-start gap-4">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FFCB74] shadow-[0_0_8px_rgba(255,203,116,0.6)]"></div>
                    <p className="text-sm text-white/50 font-medium line-clamp-1">{route.destination?.address || route.destination?.name}</p>
                </div>
            </div>

            <div className="flex gap-3 relative z-10">
                <button
                    onClick={handleQuickPlan}
                    className="flex-1 bg-[#FFCB74] hover:bg-[#ffe0ac] text-[#111111] text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#FFCB74]/5"
                >
                    <Navigation size={14} />
                    PLAN JOURNEY
                </button>

                <button
                    onClick={() => onDelete(route._id)}
                    className="p-3 bg-red-500/5 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 rounded-xl transition-all border border-white/5"
                    title="Delete Route"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default SavedRouteCard;
