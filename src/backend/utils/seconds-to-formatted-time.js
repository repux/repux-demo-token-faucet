
module.exports = function secondsToFormattedTime(timeInSeconds) {
    let seconds = timeInSeconds;

    const days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;

    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;

    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
    }

    if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    }

    if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }

    return `${seconds} second${seconds > 1 ? 's' : ''}`;
}
