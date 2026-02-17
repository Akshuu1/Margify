import { useEffect, useState } from 'react';
import SavedRouteCard from '../components/SavedRouteCard';
import { getSavedRoutes, deleteSavedRoute } from '../services/savedRoutesApi';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark } from 'lucide-react';
import gsap from 'gsap';

export const SavedRoutes = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRoutes();
    }, []);

    useEffect(() => {
        if (!loading && routes.length > 0) {
            gsap.from(".route-card", {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power3.out"
            });
        }
    }, [loading, routes]);

    const fetchRoutes = async () => {
        try {
            const data = await getSavedRoutes();
            setRoutes(data.routes || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load saved routes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this route?')) return;

        try {
            await deleteSavedRoute(id);
            setRoutes(routes.filter(r => r._id !== id));
        } catch (err) {
            alert('Failed to delete route');
        }
    };

    return (
        <div className="min-h-screen bg-[#111111] text-[#e0e0e0] pt-24 px-4 sm:px-8" style={{ fontFamily: "Space Grotesk" }}>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-[#2f2f2f] hover:bg-[#FFCB74] hover:text-[#111111] rounded-full transition-all border border-white/5"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Bookmark className="text-[#FFCB74]" size={28} />
                        <h1 className="text-3xl font-bold font-[Kiona-Regular] tracking-tight">Saved Routes</h1>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}


                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFCB74]"></div>
                    </div>
                ) : routes.length === 0 ? (
                    <div className="text-center py-20 bg-[#1c1c1c] rounded-3xl border border-white/5">
                        <Bookmark size={48} className="mx-auto text-[#FFCB74]/40 mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">No saved routes yet</h3>
                        <p className="text-white/40 mb-6">Plan a route and click the save button to see it here</p>
                        <button
                            onClick={() => navigate('/search')}
                            className="bg-[#FFCB74] hover:bg-[#ffd699] text-[#111111] px-8 py-3 rounded-xl font-bold transition-all active:scale-95"
                        >
                            Get Started
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {routes.map(route => (
                            <div key={route._id} className="route-card">
                                <SavedRouteCard
                                    route={route}
                                    onDelete={handleDelete}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
