// Dates and countdowns. The event runs on Pacific time, whatever the visitor's own clock says.
import { useEffect, useState } from 'preact/hooks';

const pacific = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

// "Sunday, November 8 at 6:00 PM PT"
export const formatPacific = date => `${pacific.format(date)} PT`;

// Whole days, hours and minutes left until `date`, never negative.
export function timeLeft(date, now) {
  const minutes = Math.max(0, Math.floor((date - now) / 60000));
  return { days: Math.floor(minutes / 1440), hours: Math.floor(minutes / 60) % 24, minutes: minutes % 60 };
}

// "3d 04h 12m", or "4h 12m" on the last day.
export function shortTimeLeft(date, now) {
  const { days, hours, minutes } = timeLeft(date, now);
  const pad = n => String(n).padStart(2, '0');
  return days ? `${days}d ${pad(hours)}h ${pad(minutes)}m` : `${hours}h ${pad(minutes)}m`;
}

// The current time, refreshed every `ms` so countdowns tick.
export function useNow(ms = 30000) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
