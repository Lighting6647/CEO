/**
 * J.A.R.V.I.S. Favorite Sites & Frequent Routes Service
 * Backed by Mem0 Persistent Long-Term Memory for sir ไลท์
 */

import { addMemory } from './mem0Service.js';

const SITES_STORAGE_KEY = 'jarvis_favorite_sites_v1';
const ROUTES_STORAGE_KEY = 'jarvis_favorite_routes_v1';

export const DEFAULT_FAVORITE_SITES = [
  {
    id: 'fav_site_01',
    name: 'D:\\Light CEO Master Dashboard',
    url: 'http://localhost:5173',
    pinned: true,
    visitCount: 42,
    lastVisited: new Date().toISOString(),
  },
  {
    id: 'fav_site_02',
    name: 'GitHub (Light Ecosystem)',
    url: 'https://github.com',
    pinned: true,
    visitCount: 38,
    lastVisited: new Date().toISOString(),
  },
  {
    id: 'fav_site_03',
    name: 'Google Thailand',
    url: 'https://www.google.com',
    pinned: false,
    visitCount: 25,
    lastVisited: new Date().toISOString(),
  },
];

export const DEFAULT_FAVORITE_ROUTES = [
  {
    id: 'fav_route_01',
    destination: 'สาทร กรุงเทพมหานคร',
    label: 'ออฟฟิศใหญ่ สาทร',
    pinned: true,
    tripCount: 28,
    lastTraveled: new Date().toISOString(),
  },
  {
    id: 'fav_route_02',
    destination: 'สนามบินสุวรรณภูมิ',
    label: 'สนามบินสุวรรณภูมิ (Suvarnabhumi Airport)',
    pinned: false,
    tripCount: 14,
    lastTraveled: new Date().toISOString(),
  },
  {
    id: 'fav_route_03',
    destination: 'สยามพารากอน',
    label: 'สยามพารากอน / ปทุมวัน',
    pinned: false,
    tripCount: 12,
    lastTraveled: new Date().toISOString(),
  },
];

let inMemorySites = [...DEFAULT_FAVORITE_SITES];
let inMemoryRoutes = [...DEFAULT_FAVORITE_ROUTES];

/**
 * Get all favorite websites from localStorage / cache
 */
export function getFavoriteSites() {
  if (typeof window === 'undefined') return inMemorySites;
  try {
    const raw = localStorage.getItem(SITES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SITES_STORAGE_KEY, JSON.stringify(DEFAULT_FAVORITE_SITES));
      return DEFAULT_FAVORITE_SITES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FAVORITE_SITES;
  } catch {
    return inMemorySites;
  }
}

/**
 * Save favorite websites to storage
 */
export function saveFavoriteSites(sites) {
  inMemorySites = sites;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SITES_STORAGE_KEY, JSON.stringify(sites));
  } catch {}
}

/**
 * Record or pin a favorite website
 */
export function recordFavoriteSite(name, url, pinned = true) {
  if (!url || !url.trim()) return null;
  const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
  const cleanName = (name || '').trim() || cleanUrl;
  const sites = getFavoriteSites();

  const existingIdx = sites.findIndex((s) => s.url.toLowerCase() === cleanUrl.toLowerCase());
  let updated;
  if (existingIdx >= 0) {
    const existing = sites[existingIdx];
    const item = {
      ...existing,
      name: cleanName,
      visitCount: (existing.visitCount || 0) + 1,
      lastVisited: new Date().toISOString(),
      pinned: pinned || existing.pinned,
    };
    updated = [item, ...sites.filter((_, idx) => idx !== existingIdx)];
  } else {
    const newItem = {
      id: `fav_site_${Date.now()}`,
      name: cleanName,
      url: cleanUrl,
      pinned,
      visitCount: 1,
      lastVisited: new Date().toISOString(),
    };
    updated = [newItem, ...sites];
  }

  saveFavoriteSites(updated);

  // Pin into Mem0 persistent memory
  try {
    addMemory(`เว็บไซต์ประจำของ sir ไลท์: ${cleanName} (${cleanUrl})`, 'favorite_sites');
  } catch {}

  return updated[0];
}

/**
 * Resolve top favorite website for "เปิดเว็บประจำ"
 */
export function resolveFavoriteSite(query = '') {
  const sites = getFavoriteSites();
  if (sites.length === 0) return DEFAULT_FAVORITE_SITES[0];

  const q = (query || '').toLowerCase().trim();
  if (q) {
    const matched = sites.find(
      (s) => s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q)
    );
    if (matched) return matched;
  }

  // Return top pinned site or highest visit count
  const pinned = sites.filter((s) => s.pinned);
  if (pinned.length > 0) {
    return pinned.sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))[0];
  }

  return sites.sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))[0];
}

/**
 * Get all frequent routes
 */
export function getFavoriteRoutes() {
  if (typeof window === 'undefined') return inMemoryRoutes;
  try {
    const raw = localStorage.getItem(ROUTES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(DEFAULT_FAVORITE_ROUTES));
      return DEFAULT_FAVORITE_ROUTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FAVORITE_ROUTES;
  } catch {
    return inMemoryRoutes;
  }
}

/**
 * Save frequent routes to storage
 */
export function saveFavoriteRoutes(routes) {
  inMemoryRoutes = routes;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
  } catch {}
}

/**
 * Record or update a frequent route
 */
export function recordFavoriteRoute(destination, label = '', pinned = true) {
  if (!destination || !destination.trim()) return null;
  const cleanDest = destination.trim();
  const cleanLabel = (label || '').trim() || cleanDest;
  const routes = getFavoriteRoutes();

  const existingIdx = routes.findIndex(
    (r) => r.destination.toLowerCase() === cleanDest.toLowerCase()
  );

  let updated;
  if (existingIdx >= 0) {
    const existing = routes[existingIdx];
    const item = {
      ...existing,
      label: cleanLabel,
      tripCount: (existing.tripCount || 0) + 1,
      lastTraveled: new Date().toISOString(),
      pinned: pinned || existing.pinned,
    };
    updated = [item, ...routes.filter((_, idx) => idx !== existingIdx)];
  } else {
    const newItem = {
      id: `fav_route_${Date.now()}`,
      destination: cleanDest,
      label: cleanLabel,
      pinned,
      tripCount: 1,
      lastTraveled: new Date().toISOString(),
    };
    updated = [newItem, ...routes];
  }

  saveFavoriteRoutes(updated);

  // Pin into Mem0 persistent memory
  try {
    addMemory(`เส้นทางประจำของ sir ไลท์: ${cleanLabel} (ปลายทาง: ${cleanDest})`, 'favorite_routes');
  } catch {}

  return updated[0];
}

/**
 * Resolve top frequent route for "เส้นทางประจำ"
 */
export function resolveFavoriteRoute(query = '') {
  const routes = getFavoriteRoutes();
  if (routes.length === 0) return DEFAULT_FAVORITE_ROUTES[0];

  const q = (query || '').toLowerCase().trim();
  if (q) {
    const matched = routes.find(
      (r) => r.destination.toLowerCase().includes(q) || r.label.toLowerCase().includes(q)
    );
    if (matched) return matched;
  }

  const pinned = routes.filter((r) => r.pinned);
  if (pinned.length > 0) {
    return pinned.sort((a, b) => (b.tripCount || 0) - (a.tripCount || 0))[0];
  }

  return routes.sort((a, b) => (b.tripCount || 0) - (a.tripCount || 0))[0];
}

/**
 * Checks if command is asking to open favorite/frequent site
 */
export function isFavoriteSiteCommand(text) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase().trim();
  return (
    lower.includes('เปิดเว็บประจำ') ||
    lower.includes('เข้าเว็บประจำ') ||
    lower.includes('เว็บประจำ') ||
    lower.includes('เว็บโปรด') ||
    lower.includes('เปิดเว็บโปรด') ||
    lower.includes('เว็บที่เข้าบ่อย')
  );
}

/**
 * Checks if command is asking to navigate to favorite/frequent route
 */
export function isFavoriteRouteCommand(text) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase().trim();
  return (
    lower.includes('เส้นทางประจำ') ||
    lower.includes('ไปที่ประจำ') ||
    lower.includes('นำทางไปที่ประจำ') ||
    lower.includes('ทางประจำ') ||
    lower.includes('สถานที่ประจำ')
  );
}
