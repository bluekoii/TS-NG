import React, { useEffect, useRef } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

export type RouteTravelMode = 'DRIVING' | 'TRANSIT' | 'WALKING' | 'BICYCLING';

export interface RouteSummary {
  distanceMeters: number;
  durationMillis: number;
}

interface RouteOverlayProps {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  travelMode: RouteTravelMode;
  onRouteComputed: (summary: RouteSummary | null) => void;
  onRouteLoading: (loading: boolean) => void;
  onRouteError: (error: string | null) => void;
}

export const RouteOverlay: React.FC<RouteOverlayProps> = ({
  origin,
  destination,
  travelMode,
  onRouteComputed,
  onRouteLoading,
  onRouteError
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    const clearPolylines = () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };

    clearPolylines();

    if (!routesLib || !map || !origin || !destination) {
      onRouteComputed(null);
      onRouteError(null);
      onRouteLoading(false);
      return;
    }

    let cancelled = false;
    onRouteLoading(true);
    onRouteError(null);

    const request = {
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      travelMode,
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport']
    };

    (routesLib.Route as any)
      .computeRoutes(request)
      .then(({ routes }: { routes: any[] }) => {
        if (cancelled) return;
        onRouteLoading(false);

        if (!routes || routes.length === 0) {
          onRouteComputed(null);
          onRouteError('No route found for this travel mode.');
          return;
        }

        const primaryRoute = routes[0];
        const newPolylines = primaryRoute.createPolylines();
        newPolylines.forEach((polyline: google.maps.Polyline) => {
          polyline.setOptions({
            strokeColor: '#0284C7',
            strokeWeight: 5,
            strokeOpacity: 0.9
          });
          polyline.setMap(map);
        });
        polylinesRef.current = newPolylines;

        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport, {
            top: 64,
            right: 420,
            bottom: 48,
            left: 48
          });
        }

        onRouteComputed({
          distanceMeters: primaryRoute.distanceMeters ?? 0,
          durationMillis: primaryRoute.durationMillis ?? 0
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        onRouteLoading(false);
        onRouteComputed(null);
        const msg = String(err instanceof Error ? err.message : err || '');
        if (
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('429') ||
          msg.includes('OVER_QUERY_LIMIT')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        onRouteError(
          'Unable to compute route for this origin and destination (e.g. offshore ferry crossings require Transit/Walk to pier).'
        );
      });

    return () => {
      cancelled = true;
      clearPolylines();
    };
  }, [routesLib, map, origin?.lat, origin?.lng, destination?.lat, destination?.lng, travelMode]);

  return null;
};
