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
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-purple-500/50 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {route.routeName}
                </h3>
                <span className="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded-full">
                    {route.usageCount || 0} trips
                </span>
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                    <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-blue-400 ring-4 ring-blue-400/20"></div>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-1">{route.source?.address || route.source?.name}</p>
                </div>

                <div className="flex items-start gap-3">
                    <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-purple-400 ring-4 ring-purple-400/20"></div>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-1">{route.destination?.address || route.destination?.name}</p>
                </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                    onClick={handleQuickPlan}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-sm py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <Navigation size={16} />
                    Plan Now
                </button>

                <button
                    onClick={() => onDelete(route._id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-lg transition-colors"
                    title="Delete Route"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default SavedRouteCard;
