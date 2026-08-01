export function dateStringUTC(date) {
  return date.toISOString().slice(0, 10);
}

export function msUntilNextUTCMidnight() {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  return next.getTime() - now.getTime();
}

export default dateStringUTC;