
export function formatDistance(meters: number): string {
  const km = meters / 1000;
  return `${km.toFixed(2)} km`;
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function formatPace(avgSpeed: number): string {
  if (avgSpeed === 0) return "N/A";
  // Convert m/s to min/km
  const secondsPerKm = 1000 / avgSpeed;
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}/km`;
}

export function formatSpeed(meterPerSecond: number): string {
  return `${(meterPerSecond * 3.6).toFixed(1)} km/h`;
}

export function formatElevation(meters: number): string {
  return `${Math.round(meters)} m`;
}
