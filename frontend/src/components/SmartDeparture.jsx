import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Calendar, Navigation, ChevronRight } from 'lucide-react';
import { getEventForDestination, getUpcomingEvents } from '../services/calendarService';

/**
 * SmartDeparture — Banner that appears on RoutesPage when the user's destination
 * matches an upcoming calendar event. Shows "Leave by X to arrive on time."
 * 
 * Props:
 *   destinationName: string — the route destination
 *   fastestRouteTime: number — minutes of the fastest route
 */
export default function SmartDeparture({ destinationName, fastestRouteTime }) {
    const [matchingEvent, setMatchingEvent] = useState(null);
    const [timeInfo, setTimeInfo] = useState(null);

    useEffect(() => {
        if (!destinationName) return;

        const event = getEventForDestination(destinationName);
        setMatchingEvent(event);

        if (event && fastestRouteTime) {
            updateTimeInfo(event, fastestRouteTime);
        }
    }, [destinationName, fastestRouteTime]);

    // Update every 30 seconds if there's a match
    useEffect(() => {
        if (!matchingEvent) return;
        const interval = setInterval(() => {
            updateTimeInfo(matchingEvent, fastestRouteTime);
        }, 30000);
        return () => clearInterval(interval);
    }, [matchingEvent, fastestRouteTime]);

    function updateTimeInfo(event, routeMinutes) {
        const eventTime = new Date(event.time);
        const now = new Date();

        // Calculate when to leave: eventTime - travelTime - 10min buffer
        const bufferMinutes = 10;
        const leaveByTime = new Date(eventTime.getTime() - (routeMinutes + bufferMinutes) * 60 * 1000);

        const minutesUntilLeave = Math.round((leaveByTime - now) / (1000 * 60));
        const minutesUntilEvent = Math.round((eventTime - now) / (1000 * 60));

        let urgency, urgencyColor, urgencyBg, urgencyBorder;
        if (minutesUntilLeave <= 0) {
            urgency = 'late';
            urgencyColor = 'text-red-400';
            urgencyBg = 'from-red-500/10 to-red-500/5';
            urgencyBorder = 'border-red-500/30';
        } else if (minutesUntilLeave <= 15) {
            urgency = 'urgent';
            urgencyColor = 'text-orange-400';
            urgencyBg = 'from-orange-500/10 to-orange-500/5';
            urgencyBorder = 'border-orange-500/30';
        } else if (minutesUntilLeave <= 45) {
            urgency = 'soon';
            urgencyColor = 'text-yellow-400';
            urgencyBg = 'from-yellow-500/10 to-yellow-500/5';
            urgencyBorder = 'border-yellow-500/30';
        } else {
            urgency = 'relaxed';
            urgencyColor = 'text-emerald-400';
            urgencyBg = 'from-emerald-500/10 to-emerald-500/5';
            urgencyBorder = 'border-emerald-500/30';
        }

        setTimeInfo({
            leaveByTime,
            minutesUntilLeave,
            minutesUntilEvent,
            urgency,
            urgencyColor,
            urgencyBg,
            urgencyBorder,
            leaveByFormatted: leaveByTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            eventTimeFormatted: eventTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        });
    }

    if (!matchingEvent || !timeInfo) return null;

    // Don't show if event already passed
    if (timeInfo.minutesUntilEvent <= 0) return null;

    return (
        <div className={`mb-6 bg-gradient-to-r ${timeInfo.urgencyBg} border ${timeInfo.urgencyBorder} rounded-2xl p-5 shadow-xl relative overflow-hidden`}>
            {/* Animated pulse for urgent states */}
            {(timeInfo.urgency === 'urgent' || timeInfo.urgency === 'late') && (
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-500 animate-ping opacity-50"></div>
            )}

            <div className="flex items-start gap-4 relative z-10">
                <div className={`p-3 rounded-xl ${timeInfo.urgency === 'late' ? 'bg-red-500/20' : 'bg-white/5'} shrink-0`}>
                    {timeInfo.urgency === 'late' ? (
                        <AlertTriangle size={22} className="text-red-400" />
                    ) : (
                        <Calendar size={22} className={timeInfo.urgencyColor} />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-black uppercase tracking-widest text-white/60">Smart Departure</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/5 ${timeInfo.urgencyColor}`}>
                            {timeInfo.urgency === 'late' ? 'Leave Now!'
                                : timeInfo.urgency === 'urgent' ? 'Hurry'
                                    : timeInfo.urgency === 'soon' ? 'Plan Ahead'
                                        : 'On Track'}
                        </span>
                    </div>

                    <h4 className="text-base font-bold text-white mb-1 truncate">
                        {matchingEvent.name}
                    </h4>

                    <div className="flex items-center gap-4 text-sm flex-wrap">
                        <span className={`font-bold ${timeInfo.urgencyColor}`}>
                            {timeInfo.urgency === 'late'
                                ? `You should have left ${Math.abs(timeInfo.minutesUntilLeave)}m ago`
                                : `Leave by ${timeInfo.leaveByFormatted}`
                            }
                        </span>
                        <span className="text-white/30 text-xs flex items-center gap-1">
                            <Clock size={12} />
                            Event at {timeInfo.eventTimeFormatted}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-white/20 font-medium">
                        <span>🚀 {fastestRouteTime} min fastest route</span>
                        <span>+ 10 min buffer</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
