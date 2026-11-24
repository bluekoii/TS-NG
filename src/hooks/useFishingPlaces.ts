import { useState, useEffect, useCallback, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import {
  FISHING_GROUND_SPECS,
  FishingGroundSpec,
  ResolvedFishingGround
} from '../data/fishingGrounds';

const CACHE_KEY = 'sg_fishing_places_cache_v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (< 30-day GMP caching cap)

const SINGAPORE_BOUNDS = {
  south: 1.13,
  west: 103.58,
  north: 1.48,
  east: 104.12
};

interface CachedEntry {
  placeId: string;
  resolvedName: string;
  lat: number;
  lng: number;
  formattedAddress: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsURI?: string;
}

interface CachePayload {
  updatedAt: number;
  items: Record<string, CachedEntry>;
}

function readCache(): Record<string, CachedEntry> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CachePayload;
    if (!parsed || typeof parsed.updatedAt !== 'number' || !parsed.items) return {};
    if (Date.now() - parsed.updatedAt > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return {};
    }
    return parsed.items;
  } catch {
    return {};
  }
}

function writeCache(items: Record<string, CachedEntry>) {
  try {
    const payload: CachePayload = {
      updatedAt: Date.now(),
      items
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors
  }
}

function extractQuotaError(err: unknown): boolean {
  const msg = String(err instanceof Error ? err.message : err || '');
  return (
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('429') ||
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('Quota')
  );
}

function toCachedEntry(place: google.maps.places.Place): CachedEntry | null {
  const loc = place.location;
  if (!loc || !place.id) return null;
  const lat = typeof loc.lat === 'function' ? loc.lat() : Number(loc.lat);
  const lng = typeof loc.lng === 'function' ? loc.lng() : Number(loc.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  return {
    placeId: place.id,
    resolvedName: place.displayName || '',
    lat,
    lng,
    formattedAddress: place.formattedAddress || 'Singapore',
    rating: typeof place.rating === 'number' ? place.rating : undefined,
    userRatingCount:
      typeof place.userRatingCount === 'number' ? place.userRatingCount : undefined,
    googleMapsURI: place.googleMapsURI || undefined
  };
}

function mergeSpecAndEntry(
  spec: FishingGroundSpec,
  entry: CachedEntry
): ResolvedFishingGround {
  return {
    ...spec,
    ...entry
  };
}

function matchPlaceToSpec(
  place: google.maps.places.Place,
  specs: FishingGroundSpec[]
): FishingGroundSpec | undefined {
  const display = (place.displayName || '').toLowerCase();
  const addr = (place.formattedAddress || '').toLowerCase();
  const haystack = `${display} ${addr}`;
  return specs.find((s) => s.matchTerms.some((term) => haystack.includes(term)));
}

export function useFishingPlaces() {
  const placesLib = useMapsLibrary('places');
  const [grounds, setGrounds] = useState<ResolvedFishingGround[]>(() => {
    const cached = readCache();
    return FISHING_GROUND_SPECS.filter((s) => Boolean(cached[s.id])).map((s) =>
      mergeSpecAndEntry(s, cached[s.id])
    );
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resolvedCount, setResolvedCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const runningRef = useRef<boolean>(false);

  const resolveAll = useCallback(
    async (forceRefresh = false) => {
      if (!placesLib?.Place || runningRef.current) return;

      const cacheMap: Record<string, CachedEntry> = forceRefresh ? {} : readCache();
      if (forceRefresh) {
        try {
          localStorage.removeItem(CACHE_KEY);
        } catch {
          // ignore
        }
      }

      const initialResolved = FISHING_GROUND_SPECS.filter((s) =>
        Boolean(cacheMap[s.id])
      ).map((s) => mergeSpecAndEntry(s, cacheMap[s.id]));

      if (initialResolved.length === FISHING_GROUND_SPECS.length && !forceRefresh) {
        setGrounds(initialResolved);
        setResolvedCount(initialResolved.length);
        setIsLoading(false);
        return;
      }

      runningRef.current = true;
      setIsLoading(true);
      setError(null);
      setGrounds(initialResolved);
      setResolvedCount(initialResolved.length);

      const fields = [
        'id',
        'displayName',
        'location',
        'formattedAddress',
        'rating',
        'userRatingCount',
        'googleMapsURI'
      ];

      try {
        // Step 1: 4 broad Singapore queries to capture major reservoirs, parks, canals, and islands
        // in minimal Places API (New) calls to conserve quota.
        const broadQueries = [
          'Reservoir Park Singapore',
          'Coastal Park Fishing Jetty Singapore',
          'ABC Waters Canal River Park Singapore',
          'Pulau Ubin Lazarus Kusu Sisters Chek Jawa Coney Island Singapore'
        ];

        const missingSpecs = () =>
          FISHING_GROUND_SPECS.filter((s) => !cacheMap[s.id]);

        for (const textQuery of broadQueries) {
          if (missingSpecs().length === 0) break;
          try {
            const { places } = await placesLib.Place.searchByText({
              textQuery,
              fields,
              locationRestriction: SINGAPORE_BOUNDS,
              maxResultCount: 20,
              language: 'en',
              region: 'sg'
            });
            for (const p of places || []) {
              const matched = matchPlaceToSpec(p, missingSpecs());
              if (matched) {
                const entry = toCachedEntry(p);
                if (entry) {
                  cacheMap[matched.id] = entry;
                }
              }
            }
          } catch (err) {
            if (extractQuotaError(err)) {
              window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
              throw err;
            }
          }
        }

        // Update UI incrementally after broad sweep
        writeCache(cacheMap);
        const afterBroad = FISHING_GROUND_SPECS.filter((s) =>
          Boolean(cacheMap[s.id])
        ).map((s) => mergeSpecAndEntry(s, cacheMap[s.id]));
        setGrounds(afterBroad);
        setResolvedCount(afterBroad.length);

        // Step 2: Targeted individual queries for remaining specific spots (in batches of 3)
        const remaining = missingSpecs();
        for (let i = 0; i < remaining.length; i += 3) {
          const batch = remaining.slice(i, i + 3);
          await Promise.all(
            batch.map(async (spec) => {
              try {
                const { places } = await placesLib.Place.searchByText({
                  textQuery: spec.searchQuery,
                  fields,
                  locationRestriction: SINGAPORE_BOUNDS,
                  maxResultCount: 1,
                  language: 'en',
                  region: 'sg'
                });
                const first = places?.[0];
                if (first) {
                  const entry = toCachedEntry(first);
                  if (entry) {
                    cacheMap[spec.id] = entry;
                  }
                }
              } catch (err) {
                if (extractQuotaError(err)) {
                  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
                  throw err;
                }
              }
            })
          );

          writeCache(cacheMap);
          const partial = FISHING_GROUND_SPECS.filter((s) =>
            Boolean(cacheMap[s.id])
          ).map((s) => mergeSpecAndEntry(s, cacheMap[s.id]));
          setGrounds(partial);
          setResolvedCount(partial.length);
        }
      } catch (err) {
        if (extractQuotaError(err)) {
          setError(
            'Google Maps Places API quota limit reached. Cached spots remain interactive.'
          );
        } else {
          setError('Unable to load some fishing ground locations from Google Places.');
        }
      } finally {
        runningRef.current = false;
        setIsLoading(false);
      }
    },
    [placesLib]
  );

  useEffect(() => {
    if (placesLib) {
      void resolveAll(false);
    }
  }, [placesLib, resolveAll]);

  return {
    grounds,
    totalSpecs: FISHING_GROUND_SPECS.length,
    resolvedCount,
    isLoading,
    error,
    refreshLocations: () => resolveAll(true)
  };
}
