export type AgencyType = 'PUB' | 'NParks' | 'Prohibited';

export type RegionType =
  | 'East'
  | 'West'
  | 'North'
  | 'Central / South'
  | 'Offshore Islands';

export type WaterType =
  | 'Freshwater Reservoir'
  | 'Waterway / Canal'
  | 'Coastal / Jetty'
  | 'Offshore Island'
  | 'No-Take / Prohibited';

export interface FishingGroundSpec {
  id: string;
  name: string;
  searchQuery: string;
  matchTerms: string[];
  agency: AgencyType;
  region: RegionType;
  waterType: WaterType;
  legalStatus: 'Legal — Designated Zones' | 'Prohibited — No-Take Zone';
  baitRule: string;
  onSiteCue: string;
  regulations: string[];
  commonSpecies: string[];
  notes: string;
}

export interface ResolvedFishingGround extends FishingGroundSpec {
  placeId: string;
  resolvedName: string;
  lat: number;
  lng: number;
  formattedAddress: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsURI?: string;
}

export const PUB_STANDARD_RULES = [
  'Fish only within designated areas marked by blue railings and official PUB fishing-zone signage.',
  'Use artificial bait or lures only — live bait, dead animal/fish bait, and chumming are strictly prohibited.',
  'No fly fishing within PUB reservoir grounds.',
  'Use barbless or micro-barb carbon-steel hooks where required near NParks reservoir parks.',
  'Give space to kayakers, paddleboarders, and pedestrians; never string lines across walkways.',
  'Fishing outside designated zones carries fines of up to SGD 3,000.'
];

export const NPARKS_STANDARD_RULES = [
  'Use rod-and-line or handline only — nets, driftnets, and wire-mesh fish traps are strictly prohibited.',
  'Fish only in designated stretches and jetties; stay clear of "No Fishing" signs, swimming lagoons, ferry terminals, and mangroves.',
  'Practice catch-and-release for juveniles, undersized catches, and protected or vulnerable marine species.',
  'Keep lines clear of coastal wildlife including otters and shorebirds, and dispose of all monofilament line and hooks properly.'
];

export const FISHING_GROUND_SPECS: FishingGroundSpec[] = [
  // =========================================================================
  // PUB DESIGNATED RESERVOIRS & WATERWAYS (15 OFFICIAL GROUNDS)
  // =========================================================================
  {
    id: 'bedok-reservoir',
    name: 'Bedok Reservoir',
    searchQuery: 'Bedok Reservoir Park Singapore',
    matchTerms: ['bedok reservoir'],
    agency: 'PUB',
    region: 'East',
    waterType: 'Freshwater Reservoir',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Artificial lures only (no live/dead bait or chumming)',
    onSiteCue: 'Designated blue-railing decks & expanded trial fishing zones',
    regulations: PUB_STANDARD_RULES,
    commonSpecies: ['Peacock Bass', 'Giant Snakehead (Toman)', 'Tilapia'],
    notes:
      'One of Singapore’s premier freshwater luring venues with designated platforms and expanded trial zones along the reservoir perimeter.'
  },
  {
    id: 'jurong-lake',
    name: 'Jurong Lake',
    searchQuery: 'Jurong Lake Gardens Singapore',
    matchTerms: ['jurong lake'],
    agency: 'PUB',
    region: 'West',
    waterType: 'Freshwater Reservoir',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Artificial lures only · Micro-barb or barbless carbon-steel hooks',
    onSiteCue: 'Official PUB blue railings & Jurong Lake Gardens fishing decks',
    regulations: PUB_STANDARD_RULES,
    commonSpecies: ['Peacock Bass', 'Haruan', 'Tilapia'],
    notes:
      'Designated fishing decks integrated along Jurong Lake Gardens. Observe both PUB water-quality bait rules and NParks park signage.'
  },
  {
    id: 'pandan-reservoir',
    name: 'Pandan Reservoir',
    searchQuery: 'Pandan Reservoir Singapore',
    matchTerms: ['pandan reservoir'],
    agency: 'PUB',
    region: 'West',
    waterType: 'Freshwater Reservoir',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Artificial lures only · Barbless or micro-barb hooks',
    onSiteCue: 'Dedicated PUB fishing jetties & blue-railing platforms',
    regulations: PUB_STANDARD_RULES,
    commonSpecies: ['Peacock Bass', 'Toman', 'Tilapia'],
    notes:
      'Elevated concrete embankment reservoir with dedicated fishing jetties. Mind the rowing lane buoys and shared boardwalk paths.'
  },
  {
    id: 'pang-sua-canal',
    name: 'Pang Sua Canal',
    searchQuery: 'Pang Sua Pond Bukit Panjang Singapore',
    matchTerms: ['pang sua'],
    agency: 'PUB',
    region: 'West',
    waterType: 'Waterway / Canal',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Artificial lures only (no organic bait or chumming)',
    onSiteCue: 'Marked ABC Waters blue railings & fishing-zone signage',
    regulations: PUB_STANDARD_RULES,
    commonSpecies: ['Tilapia', 'Peacock Bass', 'Catfish'],
    notes:
      'ABC Waters canal network in Bukit Panjang with designated casting zones along the concrete banks and retention pond.'
  },
  {
    id: 'kranji-reservoir',
    name: 'Kranji Reservoir',
    searchQuery: 'Kranji Reservoir Park Singapore',
    matchTerms: ['kranji reservoir'],
    agency: 'PUB',
    region: 'North',
    waterType: 'Freshwater Reservoir',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Artificial lures only (no live bait or chumming)',
    onSiteCue: 'Blue railings & official PUB fishing-zone signs at Kranji Reservoir Park',
    regulations: PUB_STANDARD_RULES,
    commonSpecies: ['Toman', 'Peacock Bass', 'Tarpon (Indo-Pacific)'],
    notes:
      'Offers access to freshwater and near-brackish sections near the tidal barrage. Stay strictly within the marked blue-railing stretches.'
  },
  {
    id: 'lower-seletar-reservoir',
    name: 'Lower Seletar Reservoir',
    searchQuery: 'Lower Seletar Reservoir Park Fishing Jetty Singapore',
    matchTerms: ['lower seletar'],
    agency: 'PUB',
    region: 'North',
    waterType: 'Freshwater Reservoir',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Artificial lures only (no organic bait or fly fishing)',
    onSiteCue: 'Lower Seletar Fishing Jetty & designated blue-railing shoreline',
    regulations: PUB_STANDARD_RULES,
    commonSpecies: ['Peacock Bass', 'Toman', 'Mayan Cichlid'],
    notes:
      'Features a dedicated fishing jetty along Yishun Avenue 1 and clear casting zones away from the water sports centre.'
  },
  {
    id: 'upper-seletar-reservoir',
    name: 'Upper Seletar Reservoir',
    searchQuery: 'Upper Seletar Reservoir Park Singapore',
    matchTerms: ['upper seletar'],
    agency: 'PUB',
    region: 'North',
    waterType: 'Freshwater Reservoir',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Artificial lures only (no live/dead bait)',
    onSiteCue: 'Designated blue-railing zone near Upper Seletar Reservoir Park',
    regulations: PUB_STANDARD_RULES,
    commonSpecies: ['Peacock Bass', 'Toman', 'Tilapia'],
    notes:
      'Quiet central-north reservoir surrounded by nature reserve forest; casting is restricted strictly to the designated shoreline railings.'
  },
  {
    id: 'marina-reservoir',
    name: 'Marina Reservoir',
    searchQuery: 'Marina Barrage Singapore',
    matchTerms: ['marina barrage', 'marina reservoir'],
    agency: 'PUB',
    region: 'Central / South',
    waterType: 'Freshwater Reservoir',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Artificial lures only inside the reservoir basin',
    onSiteCue: 'Blue-railing fishing zones along Marina Reservoir & Kallang Basin channels',
    regulations: PUB_STANDARD_RULES,
    commonSpecies: ['Peacock Bass', 'Barramundi', 'Tarpon'],
    notes:
      'Urban freshwater basin encompassing designated casting zones around Marina Barrage, Gardens by the Bay East, and Kallang Basin.'
  },
  {
    id: 'lower-peirce-reservoir',
    name: 'Lower Peirce Reservoir',
    searchQuery: 'Lower Peirce Reservoir Park Singapore',
    matchTerms: ['lower peirce'],
    agency: 'PUB',
    region: 'Central / South',
    waterType: 'Freshwater Reservoir',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Artificial lures only · Micro-barb or barbless hooks',
    onSiteCue: 'Marked PUB fishing-zone railings near Casuarina entrance',
    regulations: PUB_STANDARD_RULES,
    commonSpecies: ['Peacock Bass', 'Toman', 'Tilapia'],
    notes:
      'Singapore’s second-oldest reservoir. Fishing is strictly limited to designated shoreline segments away from protected boardwalk forest.'
  },
  {
    id: 'macritchie-reservoir',
    name: 'MacRitchie Reservoir',
    searchQuery: 'MacRitchie Reservoir Park Singapore',
    matchTerms: ['macritchie reservoir'],
    agency: 'PUB',
    region: 'Central / South',
    waterType: 'Freshwater Reservoir',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Artificial lures only (no live bait, no fly fishing)',
    onSiteCue: 'Designated blue railings near the main park boardwalk & Zig-Zag bridge',
    regulations: PUB_STANDARD_RULES,
    commonSpecies: ['Peacock Bass', 'Giant Snakehead (Toman)', 'Temensis'],
    notes:
      'Popular central catchment reservoir. Keep clear of the canoeing pontoon and forested nature trail banks outside blue railings.'
  },
  {
    id: 'serangoon-reservoir',
    name: 'Serangoon Reservoir',
    searchQuery: 'Lorong Halus Wetland Serangoon Reservoir Singapore',
    matchTerms: ['serangoon reservoir', 'lorong halus'],
    agency: 'PUB',
    region: 'East',
    waterType: 'Freshwater Reservoir',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Artificial lures only (no organic bait or chumming)',
    onSiteCue: 'PUB fishing-zone signs & blue railings along the eastern/western banks',
    regulations: PUB_STANDARD_RULES,
    commonSpecies: ['Peacock Bass', 'Barramundi', 'Tarpon'],
    notes:
      'Note: While designated banks along Serangoon Reservoir permit fishing, Coney Island Park on the opposite shore is strictly a No-Fishing zone.'
  },
  {
    id: 'geylang-river',
    name: 'Geylang River',
    searchQuery: 'Geylang River ABC Waters Singapore',
    matchTerms: ['geylang river'],
    agency: 'PUB',
    region: 'Central / South',
    waterType: 'Waterway / Canal',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Artificial lures only',
    onSiteCue: 'Marked blue-railing decks along the Geylang River park connector',
    regulations: PUB_STANDARD_RULES,
    commonSpecies: ['Tilapia', 'Tarpon', 'Peacock Bass'],
    notes:
      'Urbanized ABC Waters waterway connecting into Marina Reservoir. Cast only from designated railing sections.'
  },
  {
    id: 'kolam-ayer-waterfront',
    name: 'Kolam Ayer ABC Waterfront',
    searchQuery: 'Kolam Ayer ABC Waterfront Singapore',
    matchTerms: ['kolam ayer'],
    agency: 'PUB',
    region: 'Central / South',
    waterType: 'Waterway / Canal',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Artificial lures only (no live bait or chumming)',
    onSiteCue: 'Designated community fishing decks & blue railings along Kallang River',
    regulations: PUB_STANDARD_RULES,
    commonSpecies: ['Tilapia', 'Peacock Bass', 'Catfish'],
    notes:
      'Accessible ABC Waters promenade along the Kallang River near Geylang Bahru with purpose-built fishing decks.'
  },
  {
    id: 'pelton-canal',
    name: 'Pelton Canal',
    searchQuery: 'Pelton Canal Park Connector Singapore',
    matchTerms: ['pelton canal'],
    agency: 'PUB',
    region: 'East',
    waterType: 'Waterway / Canal',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Artificial lures only',
    onSiteCue: 'Official PUB fishing-zone signage along Pelton Canal',
    regulations: PUB_STANDARD_RULES,
    commonSpecies: ['Tilapia', 'Haruan', 'Catfish'],
    notes:
      'Neighbourhood waterway running between Ubi, MacPherson, and Kallang River with marked fishing stretches.'
  },
  {
    id: 'rochor-canal',
    name: 'Rochor Canal',
    searchQuery: 'Rochor Canal Singapore',
    matchTerms: ['rochor canal'],
    agency: 'PUB',
    region: 'Central / South',
    waterType: 'Waterway / Canal',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Artificial lures only',
    onSiteCue: 'Dedicated PUB fishing decks & blue railings along Rochor Canal',
    regulations: PUB_STANDARD_RULES,
    commonSpecies: ['Tilapia', 'Peacock Bass', 'Tarpon'],
    notes:
      'Central urban waterway featuring dedicated recessed fishing decks along the rejuvenated Rochor Canal promenade.'
  },

  // =========================================================================
  // NPARKS COASTAL PARKS, JETTIES & OFFSHORE ISLANDS (13 OFFICIAL GROUNDS)
  // =========================================================================
  {
    id: 'bedok-jetty',
    name: 'Bedok Jetty (East Coast Park Area F)',
    searchQuery: 'Bedok Jetty East Coast Park Singapore',
    matchTerms: ['bedok jetty'],
    agency: 'NParks',
    region: 'East',
    waterType: 'Coastal / Jetty',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Saltwater bait & lures allowed · Rod-and-line / handline only (no nets)',
    onSiteCue: '250-meter public fishing jetty at East Coast Park Area F',
    regulations: NPARKS_STANDARD_RULES,
    commonSpecies: ['Todak (Needlefish)', 'Queenfish', 'Trevally', 'Barracuda'],
    notes:
      'Singapore’s longest and most iconic coastal fishing jetty extending 250m into the Singapore Strait.'
  },
  {
    id: 'east-coast-park-beachfront',
    name: 'East Coast Park Beachfront',
    searchQuery: 'East Coast Park Area C Singapore',
    matchTerms: ['east coast park'],
    agency: 'NParks',
    region: 'East',
    waterType: 'Coastal / Jetty',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Saltwater bait & lures allowed · No nets or traps',
    onSiteCue: 'Open sandy shoreline stretches without "No Fishing" signs',
    regulations: NPARKS_STANDARD_RULES,
    commonSpecies: ['Whiting', 'Grunter', 'Stingray', 'Trevally'],
    notes:
      'Surf-casting permitted along designated sandy stretches; avoid swimming lagoons, cable-ski zones, and crowded picnic beaches.'
  },
  {
    id: 'changi-beach-park',
    name: 'Changi Beach Park',
    searchQuery: 'Changi Beach Park Singapore',
    matchTerms: ['changi beach park'],
    agency: 'NParks',
    region: 'East',
    waterType: 'Coastal / Jetty',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Saltwater bait & lures allowed · Rod-and-line or handline only',
    onSiteCue: 'Open beach stretches away from ferry terminals and swimming zones',
    regulations: NPARKS_STANDARD_RULES,
    commonSpecies: ['Javelin Grunter', 'Goatee Croaker', 'Barramundi', 'Rays'],
    notes:
      'Popular eastern surf-casting shoreline stretching from Changi Point toward Carpark 7. Mind swimmers and boat traffic.'
  },
  {
    id: 'changi-point-boardwalk',
    name: 'Changi Point Coastal Boardwalk',
    searchQuery: 'Changi Point Coastal Walk Singapore',
    matchTerms: ['changi point coastal', 'changi boardwalk'],
    agency: 'NParks',
    region: 'East',
    waterType: 'Coastal / Jetty',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Saltwater bait & lures allowed · Rod-and-line only',
    onSiteCue: 'Designated fishing zones marked on NParks Changi signage',
    regulations: NPARKS_STANDARD_RULES,
    commonSpecies: ['Snapper', 'Grouper', 'Barramundi', 'Rabbitfish'],
    notes:
      'Fishing is allowed only within designated zones along the Changi coastal areas; keep clear of Changi Point Ferry Terminal.'
  },
  {
    id: 'pasir-ris-park',
    name: 'Pasir Ris Park Beachfront',
    searchQuery: 'Pasir Ris Park Singapore',
    matchTerms: ['pasir ris park'],
    agency: 'NParks',
    region: 'East',
    waterType: 'Coastal / Jetty',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Saltwater bait & lures allowed · No nets or traps',
    onSiteCue: 'Open beachfront only — prohibited in mangroves, rivers, and park bridges',
    regulations: NPARKS_STANDARD_RULES,
    commonSpecies: ['Javelin Grunter', 'Catfish', 'Barramundi', 'Grouper'],
    notes:
      'Strictly restricted to the open coastal beachfront. Fishing inside or near Sungei Tampines, Sungei Api Api, bridges, or mangroves is prohibited.'
  },
  {
    id: 'punggol-point-jetty',
    name: 'Punggol Point Jetty',
    searchQuery: 'Punggol Point Jetty Singapore',
    matchTerms: ['punggol point jetty', 'punggol point park'],
    agency: 'NParks',
    region: 'North',
    waterType: 'Coastal / Jetty',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Saltwater bait & lures allowed · Rod-and-line / handline only',
    onSiteCue: 'Designated Punggol Point Jetty structure & nearby permitted shoreline',
    regulations: NPARKS_STANDARD_RULES,
    commonSpecies: ['Barramundi', 'Rabbitfish', 'Grouper', 'Snapper'],
    notes:
      'One of Singapore’s busiest northern coastal jetties facing Pulau Ubin across the Johor Strait.'
  },
  {
    id: 'sembawang-park-jetty',
    name: 'Sembawang Park Jetty',
    searchQuery: 'Sembawang Park Jetty Singapore',
    matchTerms: ['sembawang park'],
    agency: 'NParks',
    region: 'North',
    waterType: 'Coastal / Jetty',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Saltwater bait & lures allowed · No nets or traps',
    onSiteCue: 'Sembawang Park Jetty & permitted coastal shoreline',
    regulations: NPARKS_STANDARD_RULES,
    commonSpecies: ['Grouper', 'Snapper', 'Rabbitfish', 'Barramundi'],
    notes:
      'Quiet northern jetty facing the Johor Straits. Observe posted jetty safety signage and stay clear of adjacent shipyard waters.'
  },
  {
    id: 'woodlands-waterfront-jetty',
    name: 'Woodlands Waterfront Jetty',
    searchQuery: 'Woodlands Waterfront Park Jetty Singapore',
    matchTerms: ['woodlands waterfront'],
    agency: 'NParks',
    region: 'North',
    waterType: 'Coastal / Jetty',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Saltwater bait & lures allowed · Rod-and-line only',
    onSiteCue: 'Designated fishing spots along the 400-meter Woodlands Jetty',
    regulations: NPARKS_STANDARD_RULES,
    commonSpecies: ['Barramundi', 'Grouper', 'Threadfin', 'Snapper'],
    notes:
      'Deep-channel northern jetty overlooking the Straits of Johor. Follow posted signage on the jetty deck.'
  },
  {
    id: 'labrador-jetty',
    name: 'Labrador Jetty & Coastal Walk',
    searchQuery: 'Labrador Nature Reserve Jetty Singapore',
    matchTerms: ['labrador'],
    agency: 'NParks',
    region: 'Central / South',
    waterType: 'Coastal / Jetty',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Saltwater bait & lures allowed · No nets or traps',
    onSiteCue: 'Labrador Jetty & designated seawall promenade (observe reserve signage)',
    regulations: NPARKS_STANDARD_RULES,
    commonSpecies: ['Grouper', 'Snapper', 'Trevally', 'Queenfish'],
    notes:
      'Deep southern tidal channel. Check on-site reserve signs carefully, as adjacent Berlayer Creek and conservation zones are restricted.'
  },
  {
    id: 'west-coast-park',
    name: 'West Coast Park Seawall',
    searchQuery: 'West Coast Park Singapore',
    matchTerms: ['west coast park'],
    agency: 'NParks',
    region: 'West',
    waterType: 'Coastal / Jetty',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Saltwater bait & lures allowed · Rod-and-line / handline only',
    onSiteCue: 'Designated coastal seawall within public park boundaries',
    regulations: NPARKS_STANDARD_RULES,
    commonSpecies: ['Eeltail Catfish', 'Grunter', 'Croaker', 'Snapper'],
    notes:
      'Popular western surf-casting and bottom-fishing seawall. Stay inside park boundaries and away from port fencing.'
  },
  {
    id: 'pulau-ubin-coast',
    name: 'Pulau Ubin Coastal Areas',
    searchQuery: 'Pulau Ubin Jetty Singapore',
    matchTerms: ['pulau ubin'],
    agency: 'NParks',
    region: 'Offshore Islands',
    waterType: 'Offshore Island',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Saltwater bait & lures allowed · No nets or traps',
    onSiteCue: 'Public coastal shorelines & main jetty (excluding Chek Jawa Wetlands)',
    regulations: NPARKS_STANDARD_RULES,
    commonSpecies: ['Grouper', 'Barramundi', 'Mangrove Jack', 'Snapper'],
    notes:
      'Fishing is legal along public coastal areas on Pulau Ubin, EXCEPT Chek Jawa Wetlands where fishing is strictly prohibited.'
  },
  {
    id: 'st-johns-lazarus',
    name: 'St. John’s & Lazarus Islands Causeway',
    searchQuery: 'Lazarus Island Singapore',
    matchTerms: ['lazarus island', 'st john'],
    agency: 'NParks',
    region: 'Offshore Islands',
    waterType: 'Offshore Island',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Saltwater bait & lures allowed · Rod-and-line / handline only',
    onSiteCue: 'Rocky shores, seawalls & connecting causeway (avoid ferry jetties & swimming lagoons)',
    regulations: NPARKS_STANDARD_RULES,
    commonSpecies: ['Coral Trout', 'Grouper', 'Trevally', 'Barracuda', 'Snapper'],
    notes:
      'Clear southern waters ideal for rock and lure fishing along the causeway and breakwaters; keep clear of ferry operations and swimmers.'
  },
  {
    id: 'kusu-island',
    name: 'Kusu Island Seawalls',
    searchQuery: 'Kusu Island Singapore',
    matchTerms: ['kusu island'],
    agency: 'NParks',
    region: 'Offshore Islands',
    waterType: 'Offshore Island',
    legalStatus: 'Legal — Designated Zones',
    baitRule: 'Saltwater bait & lures allowed · No nets or traps',
    onSiteCue: 'Outer rocky seawalls away from swimming lagoons and active ferry jetty',
    regulations: NPARKS_STANDARD_RULES,
    commonSpecies: ['Snapper', 'Grouper', 'Parrotfish (release)', 'Trevally'],
    notes:
      'Accessible by public ferry from Marina South Pier. Practice catch-and-release for reef species and respect temple/lagoon areas.'
  },

  // =========================================================================
  // PROHIBITED / NO-TAKE REFERENCE ZONES (3 CRITICAL EXCLUSIONS)
  // =========================================================================
  {
    id: 'coney-island-prohibited',
    name: 'Coney Island Park (No Fishing)',
    searchQuery: 'Coney Island Park Singapore',
    matchTerms: ['coney island'],
    agency: 'Prohibited',
    region: 'North',
    waterType: 'No-Take / Prohibited',
    legalStatus: 'Prohibited — No-Take Zone',
    baitRule: 'All fishing strictly prohibited across the entire island park',
    onSiteCue: 'NParks "No Fishing" signage posted across all beaches and bridges',
    regulations: [
      'Fishing is strictly prohibited everywhere inside Coney Island Park to protect mangroves and coastal biodiversity.',
      'Anglers in the northeast may use designated banks on nearby Serangoon Reservoir or Punggol Point Jetty instead.',
      'Violations carry fines of up to SGD 3,000.'
    ],
    commonSpecies: ['Protected Mangrove & Coastal Habitat'],
    notes:
      'Frequently confused with nearby Serangoon Reservoir — Coney Island Park itself is strictly a No-Fishing zone.'
  },
  {
    id: 'chek-jawa-prohibited',
    name: 'Chek Jawa Wetlands (No Fishing)',
    searchQuery: 'Chek Jawa Wetlands Singapore',
    matchTerms: ['chek jawa'],
    agency: 'Prohibited',
    region: 'Offshore Islands',
    waterType: 'No-Take / Prohibited',
    legalStatus: 'Prohibited — No-Take Zone',
    baitRule: 'All fishing, crabbing, and collection strictly prohibited',
    onSiteCue: 'NParks conservation boundary & boardwalk warning signage on eastern Pulau Ubin',
    regulations: [
      'Chek Jawa Wetlands is a protected intertidal and marine ecosystem on Pulau Ubin.',
      'No fishing, trapping, or harvesting of marine organisms is permitted inside the wetlands reserve.'
    ],
    commonSpecies: ['Protected Intertidal & Seagrass Ecosystem'],
    notes:
      'While public coastal areas of Pulau Ubin allow fishing, Chek Jawa Wetlands is completely off-limits.'
  },
  {
    id: 'sisters-islands-prohibited',
    name: 'Sisters’ Islands Marine Park (No-Take)',
    searchQuery: 'Sisters Islands Marine Park Singapore',
    matchTerms: ['sisters island', 'sisters\' island'],
    agency: 'Prohibited',
    region: 'Offshore Islands',
    waterType: 'No-Take / Prohibited',
    legalStatus: 'Prohibited — No-Take Zone',
    baitRule: 'Strict No-Take Marine Park — fishing completely banned',
    onSiteCue: 'Marine Park buoys and NParks no-take zone notices',
    regulations: [
      'Singapore’s first Marine Park is a strict No-Take zone protecting coral reefs and giant clams.',
      'Fishing from shore or anchored vessels within the Marine Park boundary is strictly illegal.'
    ],
    commonSpecies: ['Protected Coral Reef & Marine Sanctuary'],
    notes:
      'For Southern Islands fishing, use permitted seawalls at nearby St. John’s Island, Lazarus Island, or Kusu Island instead.'
  }
];
