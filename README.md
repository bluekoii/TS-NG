# SG CastMap — Singapore Legal Fishing Grounds

Interactive map of Singapore's official legal fishing grounds (PUB freshwater reservoirs/waterways and NParks coastal parks, jetties, and offshore islands), prohibited no-take zones, live Open-Meteo weather forecasts, Google Routes directions, and a browser-persisted Catch Log segregated by freshwater and saltwater.

## Features

- **Official Fishing Directory**: Search and filter legal PUB freshwater spots, NParks coastal spots, and prohibited no-take reference zones by agency or region.
- **Live Spot Weather & 3-Hour Forecast**: Real-time temperature, rain probability, wind speed/direction, and 3-hour outlook via Open-Meteo.
- **Freshwater & Saltwater Catch Log**: Record fish species, quantity, and 1–5 star ratings per spot in `localStorage`, with segregated Freshwater/Saltwater views.
- **Directions & Place Details**: Integrated Google Places UI Kit details and Routes API directions (Drive, Transit, Walk, Cycle).

## Environment Variables

Configure the following variable in `.env` (for local development) or in Vercel's Environment Variables:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_platform_api_key
```

Ensure your Google Cloud project has these APIs enabled:
- Maps JavaScript API
- Places API (New)
- Routes API

If your key uses HTTP referrer restrictions, add your Vercel domain (for example `https://*.vercel.app/*`).

## Deploying to Vercel

### Option 1: GitHub + Vercel Dashboard
1. Push this project to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Framework Preset will auto-detect **Vite** (`vercel.json` sets `npm run build` and output `dist`).
4. Add `VITE_GOOGLE_MAPS_API_KEY` under **Environment Variables**.
5. Click **Deploy**.

### Option 2: Vercel CLI
```bash
npm install
npx vercel
```
Then add your key and deploy to production:
```bash
npx vercel env add VITE_GOOGLE_MAPS_API_KEY
npx vercel --prod
```