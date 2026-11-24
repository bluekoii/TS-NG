import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap
} from '@vis.gl/react-google-maps';
import {
  Search,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  X,
  LocateFixed,
  RotateCcw,
  List,
  ExternalLink,
  Car,
  TrainFront,
  Footprints,
  Bike,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import {
  AgencyType,
  RegionType,
  ResolvedFishingGround,
  FISHING_GROUND_SPECS
} from './data/fishingGrounds';
import { useFishingPlaces } from './hooks/useFishingPlaces';
import { PlaceDetailsCard, OriginAutocomplete } from './components/PlaceDetailsCard';
import {
  RouteOverlay,
  RouteSummary,
  RouteTravelMode
} from './components/RouteOverlay';
import { RulesGuideModal } from './components/RulesGuideModal';
import { SpotWeatherPanel } from './components/SpotWeatherPanel';
import { useCatchLog } from './hooks/useCatchLog';
import { SpotCatchLog } from './components/SpotCatchLog';
import { CatchLogModal } from './components/CatchLogModal';

const API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

const SINGAPORE_CENTER = { lat: 1.3521, lng: 103.8198 };
const SINGAPORE_DEFAULT_ZOOM = 11.5;

type TopFilterTab = 'all' | 'PUB' | 'NParks' | 'Prohibited';

const REGIONS: Array<{ id: 'All' | RegionType; label: string }> = [
  { id: 'All', label: 'All' },
  { id: 'East', label: 'East' },
  { id: 'West', label: 'West' },
  { id: 'North', label: 'North' },
  { id: 'Central / South', label: 'Central' },
  { id: 'Offshore Islands', label: 'Islands' }
];

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const c =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng *
      sinLng;
  return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
}

function getPinColors(agency: AgencyType, isSelected: boolean) {
  if (agency === 'PUB') {
    return {
      background: isSelected ? '#0369A1' : '#0284C7',
      borderColor: '#075985',
      glyphColor: '#FFFFFF'
    };
  }
  if (agency === 'NParks') {
    return {
      background: isSelected ? '#047857' : '#059669',
      borderColor: '#065F46',
      glyphColor: '#FFFFFF'
    };
  }
  return {
    background: isSelected ? '#B91C1C' : '#DC2626',
    borderColor: '#991B1B',
    glyphColor: '#FFFFFF'
  };
}

interface MapViewportControllerProps {
  selectedGround: ResolvedFishingGround | null;
  resetSignal: number;
}

const MapViewportController: React.FC<MapViewportControllerProps> = ({
  selectedGround,
  resetSignal
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !selectedGround) return;
    map.panTo({ lat: selectedGround.lat, lng: selectedGround.lng });
    const currentZoom = map.getZoom() ?? SINGAPORE_DEFAULT_ZOOM;
    if (currentZoom < 14) {
      map.setZoom(14.5);
    }
  }, [map, selectedGround]);

  useEffect(() => {
    if (!map || resetSignal === 0) return;
    map.panTo(SINGAPORE_CENTER);
    map.setZoom(SINGAPORE_DEFAULT_ZOOM);
  }, [map, resetSignal]);

  return null;
};

interface FishingMapWorkspaceProps {
  quotaExceeded: boolean;
}

const FishingMapWorkspace: React.FC<FishingMapWorkspaceProps> = ({
  quotaExceeded
}) => {
  const {
    grounds,
    totalSpecs,
    resolvedCount,
    isLoading,
    error: placesError,
    refreshLocations
  } = useFishingPlaces();

  const [topTab, setTopTab] = useState<TopFilterTab>('all');
  const [regionFilter, setRegionFilter] = useState<'All' | RegionType>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showProhibited, setShowProhibited] = useState<boolean>(true);
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite' | 'hybrid'>(
    'roadmap'
  );
  const [selectedGroundId, setSelectedGroundId] = useState<string | null>(null);
  const [infoWindowId, setInfoWindowId] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState<number>(0);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showCatchLogModal, setShowCatchLogModal] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const {
    entries: catchEntries,
    addEntry: addCatchEntry,
    deleteEntry: deleteCatchEntry
  } = useCatchLog();

  const catchCountBySpot = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of catchEntries) {
      counts[entry.spotId] = (counts[entry.spotId] || 0) + 1;
    }
    return counts;
  }, [catchEntries]);

  // User location & nearest finder (explicitly initiated on user click)
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Routing state
  const [routeOrigin, setRouteOrigin] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);
  const [travelMode, setTravelMode] = useState<RouteTravelMode>('DRIVING');
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [routeLoading, setRouteLoading] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const visibleGrounds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return grounds.filter((g) => {
      if (topTab !== 'all' && g.agency !== topTab) return false;
      if (topTab === 'all' && !showProhibited && g.agency === 'Prohibited') {
        return false;
      }
      if (regionFilter !== 'All' && g.region !== regionFilter) return false;
      if (q) {
        const hay = [
          g.name,
          g.region,
          g.waterType,
          g.agency,
          g.onSiteCue,
          ...g.commonSpecies
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [grounds, topTab, showProhibited, regionFilter, searchQuery]);

  const selectedGround = useMemo(
    () => grounds.find((g) => g.id === selectedGroundId) || null,
    [grounds, selectedGroundId]
  );

  const infoWindowGround = useMemo(
    () => grounds.find((g) => g.id === infoWindowId) || null,
    [grounds, infoWindowId]
  );

  const legalCount = useMemo(
    () => visibleGrounds.filter((g) => g.agency !== 'Prohibited').length,
    [visibleGrounds]
  );
  const prohibitedCount = useMemo(
    () => visibleGrounds.filter((g) => g.agency === 'Prohibited').length,
    [visibleGrounds]
  );

  const handleSelectGround = useCallback((ground: ResolvedFishingGround) => {
    setSelectedGroundId(ground.id);
    setInfoWindowId(ground.id);
    setMobileSidebarOpen(false);
    setRouteSummary(null);
    setRouteError(null);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedGroundId(null);
    setInfoWindowId(null);
    setRouteOrigin(null);
    setRouteSummary(null);
    setRouteError(null);
  }, []);

  const handleResetView = useCallback(() => {
    setResetSignal((n) => n + 1);
    setRouteOrigin(null);
    setRouteSummary(null);
    setRouteError(null);
    setInfoWindowId(null);
  }, []);

  const handleFindNearest = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not supported by this browser.');
      return;
    }
    const legalGrounds = grounds.filter((g) => g.agency !== 'Prohibited');
    if (legalGrounds.length === 0) {
      setGeoStatus('Waiting for fishing ground coordinates to finish loading.');
      return;
    }

    setIsLocating(true);
    setGeoStatus(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'My Current Location'
        };
        setUserLocation(coords);

        let nearest = legalGrounds[0];
        let bestDist = haversineKm(coords, nearest);
        for (let i = 1; i < legalGrounds.length; i++) {
          const d = haversineKm(coords, legalGrounds[i]);
          if (d < bestDist) {
            bestDist = d;
            nearest = legalGrounds[i];
          }
        }

        setTopTab('all');
        setRegionFilter('All');
        setSearchQuery('');
        setSelectedGroundId(nearest.id);
        setInfoWindowId(nearest.id);
        setRouteOrigin(coords);
        setGeoStatus(
          `Nearest legal spot: ${nearest.name} (${bestDist.toFixed(1)} km away)`
        );
      },
      () => {
        setIsLocating(false);
        setGeoStatus(
          'Location permission denied. Select a spot or enter an origin address for directions.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [grounds]);

  const handleUseMyLocationForRoute = useCallback(() => {
    if (userLocation) {
      setRouteOrigin(userLocation);
      return;
    }
    if (!navigator.geolocation) {
      setRouteError('Geolocation is unavailable in this browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'My Current Location'
        };
        setUserLocation(coords);
        setRouteOrigin(coords);
      },
      () => {
        setIsLocating(false);
        setRouteError('Unable to access your current location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [userLocation]);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Three-Zone Top Bar Contract */}
      <header className="h-14 shrink-0 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between gap-8 z-30">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setTopTab('all');
            setRegionFilter('All');
            handleResetView();
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          SG CastMap
        </a>

        <nav
          aria-label="Fishing ground categories"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => setTopTab('all')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              topTab === 'all'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            All Grounds
          </button>
          <button
            type="button"
            onClick={() => setTopTab('PUB')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              topTab === 'PUB'
                ? 'border-sky-600 text-sky-700 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            PUB Freshwater
          </button>
          <button
            type="button"
            onClick={() => setTopTab('NParks')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              topTab === 'NParks'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            NParks Coastal
          </button>
          <button
            type="button"
            onClick={() => setShowCatchLogModal(true)}
            className="py-1 border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
          >
            {catchEntries.length > 0
              ? `Catch Log (${catchEntries.length})`
              : 'Catch Log'}
          </button>
          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="py-1 border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Rules Guide
          </button>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen((v) => !v)}
            className="md:hidden px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <List className="w-4 h-4" />
            <span>Spots</span>
          </button>
          <button
            type="button"
            onClick={handleFindNearest}
            disabled={isLocating || grounds.length === 0}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>{isLocating ? 'Locating...' : 'Find Nearest'}</span>
          </button>
        </div>
      </header>

      {/* Main Split Workspace */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Left Directory Sidebar */}
        <aside
          className={`${
            mobileSidebarOpen ? 'fixed inset-y-14 left-0 w-full sm:w-96 z-40' : 'hidden'
          } md:static md:flex md:w-[370px] lg:w-[400px] shrink-0 bg-white border-r border-slate-200 flex-col min-h-0`}
        >
          <div className="p-4 border-b border-slate-200 space-y-3 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-base font-bold text-slate-900">
                Singapore Fishing Directory
              </h1>
              <div className="md:hidden flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCatchLogModal(true)}
                  className="text-xs font-medium text-slate-700 underline whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
                >
                  {catchEntries.length > 0
                    ? `Catch Log (${catchEntries.length})`
                    : 'Catch Log'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRulesModal(true)}
                  className="text-xs font-medium text-sky-700 underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Rules Guide
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spot, species, or bait rule..."
                className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Agency Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'PUB', label: 'PUB' },
                  { id: 'NParks', label: 'NParks' },
                  { id: 'Prohibited', label: 'No-Take' }
                ] as Array<{ id: TopFilterTab; label: string }>
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (tab.id === 'Prohibited') setShowProhibited(true);
                    setTopTab(tab.id);
                  }}
                  className={`flex-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    topTab === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Segmented Region Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRegionFilter(r.id)}
                  className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    regionFilter === r.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Clean unboxed metadata summary */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2 tabular-nums">
                <span>{legalCount} legal grounds</span>
                <span aria-hidden="true">·</span>
                <span>{prohibitedCount} no-take zones</span>
              </div>
              <button
                type="button"
                onClick={refreshLocations}
                disabled={isLoading}
                title="Refresh Google Places coordinates"
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`}
                />
                <span>
                  {isLoading
                    ? `${resolvedCount}/${totalSpecs}`
                    : 'Sync'}
                </span>
              </button>
            </div>

            {geoStatus && (
              <div className="text-xs text-sky-800 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2">
                {geoStatus}
              </div>
            )}

            {placesError && (
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {placesError}
              </div>
            )}
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoading && grounds.length === 0 && (
              <div className="p-4 space-y-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="space-y-2 py-1">
                    <div className="h-4 w-2/3 bg-slate-100 rounded" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && visibleGrounds.length === 0 && (
              <div className="p-8 text-center space-y-3">
                <p className="text-sm font-medium text-slate-900">
                  No matching fishing grounds
                </p>
                <p className="text-xs text-slate-500">
                  {grounds.length === 0
                    ? `No locations resolved yet from ${FISHING_GROUND_SPECS.length} official grounds.`
                    : 'Try clearing your search term or switching region filters.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTopTab('all');
                    setRegionFilter('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {visibleGrounds.map((ground) => {
              const isSelected = ground.id === selectedGroundId;
              const isProhibited = ground.agency === 'Prohibited';
              return (
                <button
                  key={ground.id}
                  type="button"
                  onClick={() => handleSelectGround(ground)}
                  className={`w-full text-left px-4 py-3.5 transition-colors cursor-pointer ${
                    isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900 leading-snug">
                      {ground.name}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap shrink-0 ${
                        isProhibited
                          ? 'text-red-700'
                          : ground.agency === 'PUB'
                          ? 'text-sky-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {isProhibited ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>No-Take</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Legal</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 flex-wrap tabular-nums">
                    <span>{ground.agency === 'Prohibited' ? 'Restricted' : ground.agency}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ground.waterType}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ground.region}</span>
                    {(catchCountBySpot[ground.id] || 0) > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-700 font-medium">
                          {catchCountBySpot[ground.id]} logged
                        </span>
                      </>
                    )}
                  </div>

                  <p className="mt-1.5 text-xs text-slate-600 line-clamp-1">
                    {ground.baitRule}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Map Canvas Viewport */}
        <main className="flex-1 relative min-w-0 min-h-0">
          <div className="w-full h-full">
            <GoogleMap
              mapId="DEMO_MAP_ID"
              defaultCenter={SINGAPORE_CENTER}
              defaultZoom={SINGAPORE_DEFAULT_ZOOM}
              gestureHandling="greedy"
              mapTypeId={mapTypeId}
              mapTypeControl={false}
              streetViewControl={false}
              fullscreenControl={false}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              onClick={() => setInfoWindowId(null)}
              style={{ width: '100%', height: '100%' }}
            >
              <MapViewportController
                selectedGround={selectedGround}
                resetSignal={resetSignal}
              />

              <RouteOverlay
                origin={routeOrigin}
                destination={
                  selectedGround
                    ? { lat: selectedGround.lat, lng: selectedGround.lng }
                    : null
                }
                travelMode={travelMode}
                onRouteComputed={setRouteSummary}
                onRouteLoading={setRouteLoading}
                onRouteError={setRouteError}
              />

              {visibleGrounds.map((ground) => {
                const isSelected = ground.id === selectedGroundId;
                const colors = getPinColors(ground.agency, isSelected);
                return (
                  <AdvancedMarker
                    key={ground.id}
                    position={{ lat: ground.lat, lng: ground.lng }}
                    title={`${ground.name} (${ground.legalStatus})`}
                    zIndex={isSelected ? 50 : ground.agency === 'Prohibited' ? 20 : 10}
                    onClick={() => handleSelectGround(ground)}
                  >
                    <Pin
                      background={colors.background}
                      borderColor={colors.borderColor}
                      glyphColor={colors.glyphColor}
                      scale={isSelected ? 1.25 : 1.0}
                    >
                      {ground.agency === 'Prohibited' ? '✕' : ground.agency === 'PUB' ? 'F' : 'S'}
                    </Pin>
                  </AdvancedMarker>
                );
              })}

              {userLocation && (
                <AdvancedMarker
                  position={{ lat: userLocation.lat, lng: userLocation.lng }}
                  title="Your Current Location"
                  zIndex={60}
                >
                  <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-white shadow-md" />
                </AdvancedMarker>
              )}

              {infoWindowGround && !selectedGround && (
                <InfoWindow
                  position={{
                    lat: infoWindowGround.lat,
                    lng: infoWindowGround.lng
                  }}
                  onCloseClick={() => setInfoWindowId(null)}
                >
                  <div className="p-1 max-w-[240px]">
                    <p className="text-sm font-bold text-slate-900">
                      {infoWindowGround.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {infoWindowGround.agency} · {infoWindowGround.waterType}
                    </p>
                    <p className="text-xs text-slate-700 mt-1.5">
                      {infoWindowGround.baitRule}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>

          {/* Floating Map Controls (Top-Left on map canvas) */}
          <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
              {(
                [
                  { id: 'roadmap', label: 'Map' },
                  { id: 'satellite', label: 'Satellite' },
                  { id: 'hybrid', label: 'Hybrid' }
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMapTypeId(m.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    mapTypeId === m.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {topTab === 'all' && (
              <button
                type="button"
                onClick={() => setShowProhibited((v) => !v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  showProhibited
                    ? 'bg-white border-red-200 text-red-700 hover:bg-red-50'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {showProhibited ? 'No-Take Zones Shown' : 'No-Take Zones Hidden'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetView}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Island View</span>
            </button>
          </div>

          {/* Compact Map Legend (Bottom-Left) */}
          <div className="hidden sm:flex absolute bottom-5 left-3 z-20 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm px-3.5 py-2.5 items-center gap-4 text-xs text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-sky-600 inline-block shrink-0" />
              <span className="whitespace-nowrap">PUB Freshwater (F)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block shrink-0" />
              <span className="whitespace-nowrap">NParks Coastal (S)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-red-600 inline-block shrink-0" />
              <span className="whitespace-nowrap">Prohibited No-Take (✕)</span>
            </div>
          </div>

          {/* Right-hand Ground Inspector & Directions Drawer */}
          {selectedGround && (
            <section
              aria-label="Selected fishing ground details"
              className="absolute top-3 right-3 bottom-3 w-[calc(100%-1.5rem)] sm:w-[390px] bg-white border border-slate-200 rounded-xl shadow-lg z-30 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-3 shrink-0">
                <div className="min-w-0">
                  <div
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold mb-1 ${
                      selectedGround.agency === 'Prohibited'
                        ? 'text-red-700'
                        : selectedGround.agency === 'PUB'
                        ? 'text-sky-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {selectedGround.agency === 'Prohibited' ? (
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{selectedGround.legalStatus}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {selectedGround.name}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedGround.agency === 'Prohibited'
                      ? 'Restricted Area'
                      : selectedGround.agency}{' '}
                    · {selectedGround.waterType} · {selectedGround.region}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseDetails}
                  aria-label="Close detail panel"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Details Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm">
                {/* Official Google Places UI Kit Card */}
                <div>
                  <PlaceDetailsCard placeId={selectedGround.placeId} />
                </div>

                {/* Live Weather & 3-Hour Forecast */}
                <SpotWeatherPanel
                  lat={selectedGround.lat}
                  lng={selectedGround.lng}
                />

                {/* Spot Catch Log (Freshwater / Saltwater segregated) */}
                {selectedGround.agency !== 'Prohibited' && (
                  <SpotCatchLog
                    ground={selectedGround}
                    entries={catchEntries}
                    onAddEntry={addCatchEntry}
                    onDeleteEntry={deleteCatchEntry}
                    onOpenFullLog={() => setShowCatchLogModal(true)}
                  />
                )}

                {/* Key Regulatory Specifications */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">
                      Bait &amp; Tackle Rule
                    </div>
                    <div className="mt-0.5 text-sm font-medium text-slate-900">
                      {selectedGround.baitRule}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-500">
                      On-Site Visual Boundary
                    </div>
                    <div className="mt-0.5 text-sm text-slate-700">
                      {selectedGround.onSiteCue}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-500">
                      Notes &amp; Common Species
                    </div>
                    <p className="mt-0.5 text-sm text-slate-700 leading-relaxed">
                      {selectedGround.notes}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-500">
                      {selectedGround.commonSpecies.join(' · ')}
                    </p>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-500">
                      Coordinates
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-slate-700 tabular-nums">
                      {selectedGround.lat.toFixed(5)}, {selectedGround.lng.toFixed(5)}
                    </div>
                  </div>
                </div>

                {/* Compliance Rules List */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-900">
                      Applicable Regulations
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowRulesModal(true)}
                      className="text-xs font-medium text-sky-700 hover:underline cursor-pointer"
                    >
                      Full Guide
                    </button>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                    {selectedGround.regulations.slice(0, 4).map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-slate-400 select-none">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Directions (Modern Routes API) */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-sky-600" />
                      <span>Directions to Spot</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleUseMyLocationForRoute}
                      className="text-xs font-medium text-sky-700 hover:underline cursor-pointer"
                    >
                      Use My Location
                    </button>
                  </div>

                  <OriginAutocomplete
                    onSelectOrigin={(origin) => setRouteOrigin(origin)}
                  />

                  <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg">
                    {(
                      [
                        { id: 'DRIVING', label: 'Drive', Icon: Car },
                        { id: 'TRANSIT', label: 'Transit', Icon: TrainFront },
                        { id: 'WALKING', label: 'Walk', Icon: Footprints },
                        { id: 'BICYCLING', label: 'Cycle', Icon: Bike }
                      ] as const
                    ).map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTravelMode(id)}
                        className={`flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                          travelMode === id
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>

                  {routeOrigin && (
                    <div className="text-xs text-slate-600 flex items-center justify-between gap-2">
                      <span className="truncate">
                        From: <strong className="text-slate-900">{routeOrigin.label}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setRouteOrigin(null);
                          setRouteSummary(null);
                          setRouteError(null);
                        }}
                        className="text-slate-500 hover:text-slate-900 shrink-0 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {routeLoading && (
                    <p className="text-xs text-slate-500">Computing route...</p>
                  )}

                  {routeError && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      {routeError}
                    </p>
                  )}

                  {routeSummary && (
                    <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <span className="text-slate-600">Estimated Route</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {(routeSummary.distanceMeters / 1000).toFixed(1)} km ·{' '}
                        {Math.max(1, Math.round(routeSummary.durationMillis / 60000))} min
                      </span>
                    </div>
                  )}

                  {selectedGround.googleMapsURI && (
                    <a
                      href={selectedGround.googleMapsURI}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 underline"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      <RulesGuideModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

      <CatchLogModal
        isOpen={showCatchLogModal}
        onClose={() => setShowCatchLogModal(false)}
        entries={catchEntries}
        grounds={grounds}
        onAddEntry={addCatchEntry}
        onDeleteEntry={deleteCatchEntry}
        onSelectSpot={handleSelectGround}
      />
    </div>
  );
};

export default function App() {
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  if (!API_KEY) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <h1 className="text-lg font-bold text-slate-900">
            Google Maps API Key Required
          </h1>
          <p className="text-sm text-slate-600">
            Configure <code className="font-mono text-xs">VITE_GOOGLE_MAPS_API_KEY</code> in your environment secrets to load the Singapore Legal Fishing Grounds map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={API_KEY}
      version="beta"
      language="en"
      region="SG"
      libraries={['places', 'marker', 'routes']}
    >
      <FishingMapWorkspace quotaExceeded={quotaExceeded} />
    </APIProvider>
  );
}
