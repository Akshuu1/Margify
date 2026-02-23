import { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, Trash2, MapPin, Clock, X, Navigation } from 'lucide-react';
import { getUpcomingEvents, addEvent, deleteEvent } from '../services/calendarService';
import { useNavigate } from 'react-router-dom';

/**
 * CalendarSync — Event management component for the Profile page.
 * Users can add meetings/events with a destination, then get routed there.
 */
export default function CalendarSync() {
    const [events, setEvents] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', date: '', time: '', destination: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const refreshEvents = useCallback(() => {
        setEvents(getUpcomingEvents());
    }, []);

    useEffect(() => {
        refreshEvents();
        // Refresh every minute to keep countdown timers accurate
        const interval = setInterval(refreshEvents, 60000);
        return () => clearInterval(interval);
    }, [refreshEvents]);

    const handleAddEvent = (e) => {
        e.preventDefault();
        setError('');

        const { name, date, time, destination } = formData;
        if (!name.trim() || !date || !time || !destination.trim()) {
            setError('Please fill all fields');
            return;
        }

        const eventTime = `${date}T${time}`;
        const result = addEvent(name, eventTime, { name: destination });

        if (!result) {
            setError('Event already exists or time is in the past');
            return;
        }

        setFormData({ name: '', date: '', time: '', destination: '' });
        setShowAddForm(false);
        refreshEvents();
    };

    const handleDelete = (id) => {
        deleteEvent(id);
        refreshEvents();
    };

    const handlePlanRoute = (event) => {
        navigate('/search', { state: { prefillDestination: event.destination.name } });
    };

    const getTimeUntil = (timeStr) => {
        const diff = new Date(timeStr) - new Date();
        if (diff <= 0) return 'Now';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 24) return `${Math.ceil(hours / 24)}d`;
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    const getUrgencyColor = (timeStr) => {
        const diff = (new Date(timeStr) - new Date()) / (1000 * 60);
        if (diff <= 15) return 'text-red-400 bg-red-500/10 border-red-500/20';
        if (diff <= 60) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    };

    // Get today's date in YYYY-MM-DD for min date
    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="bg-[#2a2a2a]/50 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-white text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-[#FFCB74] rounded-full"></div>
                    My Schedule
                </h3>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`p-2 rounded-xl transition-all active:scale-95 border ${showAddForm
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-[#FFCB74]/10 border-[#FFCB74]/20 text-[#FFCB74] hover:bg-[#FFCB74]/20'
                        }`}
                >
                    {showAddForm ? <X size={16} /> : <Plus size={16} />}
                </button>
            </div>

            {/* Add Event Form */}
            {showAddForm && (
                <form onSubmit={handleAddEvent} className="mb-5 p-4 bg-white/[0.02] rounded-xl border border-white/5 space-y-3">
                    <input
                        type="text"
                        placeholder="Event name (e.g. Team Meeting)"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FFCB74]/50 transition-colors placeholder-white/20"
                        maxLength={50}
                    />
                    <div className="flex gap-2">
                        <input
                            type="date"
                            min={todayStr}
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FFCB74]/50 transition-colors [color-scheme:dark]"
                        />
                        <input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FFCB74]/50 transition-colors [color-scheme:dark]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#FFCB74] shrink-0" />
                        <input
                            type="text"
                            placeholder="Destination (e.g. Connaught Place)"
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FFCB74]/50 transition-colors placeholder-white/20"
                            maxLength={100}
                        />
                    </div>
                    {error && <p className="text-red-400 text-xs font-bold">{error}</p>}
                    <button
                        type="submit"
                        className="w-full py-3 bg-[#FFCB74] hover:bg-[#eebb55] text-[#111111] rounded-xl font-black uppercase tracking-[0.15em] text-[10px] transition-all active:scale-[0.98] shadow-lg shadow-[#FFCB74]/10"
                    >
                        Add Event
                    </button>
                </form>
            )}

            {/* Event List */}
            {events.length === 0 ? (
                <div className="text-center py-6">
                    <Calendar size={28} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/20 text-xs font-medium">No upcoming events</p>
                    <p className="text-white/10 text-[10px] mt-1">Add an event to get smart departure alerts</p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="flex items-center justify-between p-3.5 bg-white/[0.02] rounded-xl border border-white/5 group hover:border-white/10 transition-all"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-white truncate">{event.name}</span>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getUrgencyColor(event.time)}`}>
                                        {getTimeUntil(event.time)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-white/30">
                                    <span className="flex items-center gap-1">
                                        <Clock size={10} />
                                        {new Date(event.time).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="flex items-center gap-1 truncate">
                                        <MapPin size={10} />
                                        {event.destination?.name || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 ml-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handlePlanRoute(event)}
                                    className="p-2 bg-[#FFCB74]/10 hover:bg-[#FFCB74]/20 text-[#FFCB74] rounded-lg transition-colors"
                                    title="Plan route to this event"
                                >
                                    <Navigation size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
