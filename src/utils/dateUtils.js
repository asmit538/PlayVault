/**
 * Date helpers shared by seed data, services and pages.
 * All values use the viewer's LOCAL calendar day (not UTC) so
 * "today" never flips unexpectedly near midnight.
 */

const pad = (n) => String(n).padStart(2, '0')

/** Format a Date as YYYY-MM-DD in local time. */
export const toISODate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/** Today as YYYY-MM-DD (local). */
export const todayISO = () => toISODate(new Date())

/**
 * YYYY-MM-DD for "today + offset days". Negative = past, positive = future.
 * Used by seed data so demo fixtures never go stale.
 */
export const daysFromToday = (offset) => {
  const d = new Date()
  d.setHours(12, 0, 0, 0) // avoid DST edge cases
  d.setDate(d.getDate() + offset)
  return toISODate(d)
}

/** Parse "7:00 PM EST" / "10:00 AM" / "18:00" into { h, m } (24h). */
const parseClock = (timeStr = '') => {
  const match = String(timeStr).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
  if (!match) return { h: 0, m: 0 }
  let h = parseInt(match[1], 10)
  const m = parseInt(match[2], 10)
  const meridiem = match[3]?.toUpperCase()
  if (meridiem === 'PM' && h < 12) h += 12
  if (meridiem === 'AM' && h === 12) h = 0
  return { h, m }
}

/** Kick-off as a Date (local time; the "EST" suffix is display-only). */
export const getMatchStart = (match) => {
  if (!match?.date) return null
  const [y, mo, d] = match.date.split('-').map(Number)
  const { h, m } = parseClock(match.time)
  return new Date(y, mo - 1, d, h, m, 0, 0)
}

/** Whole seconds until kick-off (never negative). */
export const secondsUntilMatch = (match, now = new Date()) => {
  const start = getMatchStart(match)
  if (!start) return 0
  return Math.max(0, Math.floor((start.getTime() - now.getTime()) / 1000))
}

/** Split seconds into { d, h, m, s }. */
export const splitCountdown = (totalSeconds) => ({
  d: Math.floor(totalSeconds / 86400),
  h: Math.floor((totalSeconds % 86400) / 3600),
  m: Math.floor((totalSeconds % 3600) / 60),
  s: totalSeconds % 60,
})

/** "Today" | "Tomorrow" | "Fri, Oct 30" for a YYYY-MM-DD string. */
export const friendlyDay = (isoDate) => {
  if (!isoDate) return ''
  if (isoDate === todayISO()) return 'Today'
  if (isoDate === daysFromToday(1)) return 'Tomorrow'
  const [y, mo, d] = isoDate.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/** Next upcoming match by kick-off time (earliest first), or undefined. */
export const getNextUpcomingMatch = (matches = []) =>
  matches
    .filter((m) => m.status === 'upcoming')
    .sort((a, b) => getMatchStart(a) - getMatchStart(b))[0]
