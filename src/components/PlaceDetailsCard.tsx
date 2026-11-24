import React, { useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface PlaceDetailsCardProps {
  placeId: string;
}

export const PlaceDetailsCard: React.FC<PlaceDetailsCardProps> = ({ placeId }) => {
  const placesLib = useMapsLibrary('places');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !placesLib || !placeId) return;

    container.innerHTML = '';

    const detailsEl = document.createElement('gmp-place-details-compact');
    detailsEl.setAttribute('orientation', 'horizontal');
    detailsEl.setAttribute('truncation-preferred', '');
    detailsEl.setAttribute(
      'internal-usage-attribution-ids',
      'gmp_mcp_codeassist_v1_aistudio'
    );
    detailsEl.style.width = '100%';
    detailsEl.style.borderRadius = '8px';
    detailsEl.style.border = '1px solid #e2e8f0';
    detailsEl.style.backgroundColor = '#ffffff';
    detailsEl.style.colorScheme = 'light';

    const requestEl = document.createElement('gmp-place-details-place-request');
    (requestEl as any).place = placeId;

    const contentConfig = document.createElement('gmp-place-content-config');
    contentConfig.innerHTML = `
      <gmp-place-media lightbox-preferred></gmp-place-media>
      <gmp-place-address></gmp-place-address>
      <gmp-place-rating></gmp-place-rating>
      <gmp-place-open-now-status></gmp-place-open-now-status>
      <gmp-place-attribution light-scheme-color="gray" dark-scheme-color="white"></gmp-place-attribution>
    `;

    detailsEl.appendChild(requestEl);
    detailsEl.appendChild(contentConfig);

    const onError = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      const msg = JSON.stringify(detail || '');
      if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
    };
    detailsEl.addEventListener('gmp-error', onError);

    container.appendChild(detailsEl);

    return () => {
      detailsEl.removeEventListener('gmp-error', onError);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [placesLib, placeId]);

  if (!placesLib || !placeId) {
    return (
      <div className="h-24 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-500">
        Loading Google Place details...
      </div>
    );
  }

  return <div ref={containerRef} className="w-full" />;
};

interface OriginAutocompleteProps {
  onSelectOrigin: (origin: { lat: number; lng: number; label: string }) => void;
}

export const OriginAutocomplete: React.FC<OriginAutocompleteProps> = ({
  onSelectOrigin
}) => {
  const placesLib = useMapsLibrary('places');
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelectOrigin);
  onSelectRef.current = onSelectOrigin;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !placesLib?.PlaceAutocompleteElement) return;

    container.innerHTML = '';

    const autocomplete = new placesLib.PlaceAutocompleteElement({
      includedRegionCodes: ['sg']
    });
    autocomplete.setAttribute(
      'internal-usage-attribution-ids',
      'gmp_mcp_codeassist_v1_aistudio'
    );
    (autocomplete as any).locationBias = {
      center: { lat: 1.3521, lng: 103.8198 },
      radius: 25000
    };
    autocomplete.style.width = '100%';
    autocomplete.style.colorScheme = 'light';

    const handleSelect = async (event: any) => {
      try {
        const place = event?.placePrediction?.toPlace
          ? event.placePrediction.toPlace()
          : event?.place;
        if (!place) return;
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location']
        });
        if (place.location) {
          const lat =
            typeof place.location.lat === 'function'
              ? place.location.lat()
              : Number(place.location.lat);
          const lng =
            typeof place.location.lng === 'function'
              ? place.location.lng()
              : Number(place.location.lng);
          onSelectRef.current({
            lat,
            lng,
            label: place.displayName || place.formattedAddress || 'Selected origin'
          });
        }
      } catch (err) {
        const msg = String(err instanceof Error ? err.message : err || '');
        if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      }
    };

    autocomplete.addEventListener('gmp-select', handleSelect);
    container.appendChild(autocomplete);

    return () => {
      autocomplete.removeEventListener('gmp-select', handleSelect);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [placesLib]);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[40px] rounded-lg border border-slate-200 bg-white overflow-visible"
    />
  );
};
