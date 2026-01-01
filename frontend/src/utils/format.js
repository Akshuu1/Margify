export function formatDuration(minutes) {
    if (!minutes) return "0 min"
    if (minutes < 60) return `${minutes} min`

    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)

    if (mins === 0) {
        return `${hours} hr`
    }
    return `${hours} hr ${mins} min`
}

export function formatCurrency(amount) {
    return `₹${amount}`
}
