/**
 * Backdrop source for the ambient Landing / Focus screens.
 *
 * Fetches a fitting photo from Unsplash (French scenes by day, a cosmic night
 * sky in the small hours), caches it in localStorage for the rest of the day to
 * stay well under the demo rate limit, and always falls back to a bundled CSS
 * gradient "skin" so the screen looks intentional with no key or no network.
 */

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined;
const CACHE_PREFIX = 'bonjour-backdrop:';

export interface Backdrop {
  /** Photo URL, or null when we're using a CSS-gradient fallback. */
  imageUrl: string | null;
  /** A CSS background value to show under/instead of the image. */
  gradient: string;
  /** Whether this is a night-sky variant (used to tune scrim/animation). */
  night: boolean;
  attribution: { name: string; profileUrl: string; photoUrl: string } | null;
}

const UNSPLASH_REFERRAL = 'utm_source=bonjour_survival&utm_medium=referral';

/** Day scenes rotate; night is always a starfield. */
const DAY_QUERIES = [
  'paris street',
  'paris cafe',
  'france countryside',
  'french riviera',
  'eiffel tower',
  'paris architecture',
  'provence lavender',
];
const NIGHT_QUERY = 'night sky stars galaxy';

/** Warm Parisian-dusk gradient (day) / deep cosmic gradient (night) fallbacks. */
const DAY_GRADIENT =
  'radial-gradient(120% 120% at 70% 10%, #f6b67a 0%, #d9776a 32%, #8e4b6e 64%, #3a2a52 100%)';
const NIGHT_GRADIENT =
  'radial-gradient(120% 120% at 50% 0%, #2a2350 0%, #1a1a3e 38%, #0d0d24 70%, #050510 100%)';

export function isNightHours(date = new Date()): boolean {
  const h = date.getHours() + date.getMinutes() / 60;
  return h >= 1 && h < 4.5;
}

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

export function backdropQuery(date = new Date()): string {
  if (isNightHours(date)) return NIGHT_QUERY;
  return DAY_QUERIES[dayOfYear(date) % DAY_QUERIES.length];
}

function fallback(night: boolean): Backdrop {
  return {
    imageUrl: null,
    gradient: night ? NIGHT_GRADIENT : DAY_GRADIENT,
    night,
    attribution: null,
  };
}

function cacheKey(query: string, date: Date): string {
  return `${CACHE_PREFIX}${date.toISOString().slice(0, 10)}:${query}`;
}

function readCache(key: string): Backdrop | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Backdrop) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, value: Backdrop): void {
  try {
    // Drop other days' entries so the cache can't grow unbounded.
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX) && k !== key) localStorage.removeItem(k);
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — non-fatal, we just won't cache */
  }
}

/**
 * Resolve the backdrop for `date`. Returns a cached/fetched photo when an
 * Unsplash key is configured and the request succeeds; otherwise a gradient.
 */
export async function getBackdrop(date = new Date()): Promise<Backdrop> {
  const night = isNightHours(date);
  const query = backdropQuery(date);
  const key = cacheKey(query, date);

  const cached = readCache(key);
  if (cached) return cached;

  if (!ACCESS_KEY) return fallback(night);

  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?orientation=landscape&content_filter=high&query=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } }
    );
    if (!res.ok) return fallback(night);

    const data = await res.json();
    const photo = Array.isArray(data) ? data[0] : data;
    const rawUrl: string | undefined = photo?.urls?.raw ?? photo?.urls?.regular;
    if (!rawUrl) return fallback(night);

    const imageUrl = photo.urls.raw
      ? `${photo.urls.raw}&w=2000&q=80&fm=jpg&fit=max`
      : rawUrl;

    const result: Backdrop = {
      imageUrl,
      gradient: night ? NIGHT_GRADIENT : DAY_GRADIENT,
      night,
      attribution: {
        name: photo?.user?.name ?? 'Unknown',
        profileUrl: `${photo?.user?.links?.html ?? 'https://unsplash.com'}?${UNSPLASH_REFERRAL}`,
        photoUrl: `${photo?.links?.html ?? 'https://unsplash.com'}?${UNSPLASH_REFERRAL}`,
      },
    };
    writeCache(key, result);
    return result;
  } catch {
    return fallback(night);
  }
}
