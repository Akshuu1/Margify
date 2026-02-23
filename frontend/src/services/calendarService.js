/**
 * Calendar Service — localStorage-based calendar event management.
 * 
 * Event schema:
 * {
 *   id: string (UUID),
 *   name: string,
 *   time: ISO string,
 *   destination: { name: string, lat: number, lng: number },
 *   createdAt: ISO string
 * }
 */

const STORAGE_KEY = 'margify_calendar_events';

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Get all events, sorted by time ascending.
 * Auto-cleans events older than 24 hours.
 */
export function getEvents() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        const events = JSON.parse(raw);
        if (!Array.isArray(events)) return [];

        // Auto-archive: remove events more than 24h in the past
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const active = events.filter(e => e.time > cutoff);

        // If we cleaned any, persist the cleaned list
        if (active.length !== events.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
        }

        // Sort by time ascending
        active.sort((a, b) => new Date(a.time) - new Date(b.time));

        return active;
    } catch {
        return [];
    }
}

/**
 * Get only upcoming events (time > now).
 */
export function getUpcomingEvents() {
    const now = new Date().toISOString();
    return getEvents().filter(e => e.time > now);
}

/**
 * Add a new event.
 * Returns the created event, or null if validation fails.
 */
export function addEvent(name, time, destination) {
    // Validate
    if (!name || !name.trim()) return null;
    if (!time) return null;
    if (!destination || !destination.name) return null;

    const eventTime = new Date(time);
    if (isNaN(eventTime.getTime())) return null;

    // Don't allow events in the past
    if (eventTime < new Date()) return null;

    const events = getEvents();

    // Duplicate detection: same name + same hour = duplicate
    const isDuplicate = events.some(e => {
        const existingTime = new Date(e.time);
        return e.name === name.trim() &&
            Math.abs(existingTime - eventTime) < 60 * 60 * 1000; // within 1 hour
    });

    if (isDuplicate) return null;

    const newEvent = {
        id: generateId(),
        name: name.trim(),
        time: eventTime.toISOString(),
        destination: {
            name: destination.name,
            lat: destination.lat || null,
            lng: destination.lng || null,
        },
        createdAt: new Date().toISOString(),
    };

    events.push(newEvent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));

    return newEvent;
}

/**
 * Delete an event by ID.
 * Returns true if deleted, false if not found.
 */
export function deleteEvent(id) {
    if (!id) return false;

    const events = getEvents();
    const filtered = events.filter(e => e.id !== id);

    if (filtered.length === events.length) return false; // not found

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
}

/**
 * Find the nearest upcoming event that matches a destination name.
 * Used by SmartDeparture to check if the user is routing to an event location.
 * 
 * Returns the matching event or null.
 */
export function getEventForDestination(destinationName) {
    if (!destinationName) return null;

    const upcoming = getUpcomingEvents();
    const destLower = destinationName.toLowerCase();

    // Match by partial name (destination contains event destination or vice versa)
    return upcoming.find(e => {
        const eventDest = (e.destination?.name || '').toLowerCase();
        return destLower.includes(eventDest) || eventDest.includes(destLower);
    }) || null;
}

/**
 * Get the count of upcoming events.
 */
export function getUpcomingCount() {
    return getUpcomingEvents().length;
}
