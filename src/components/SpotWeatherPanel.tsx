import React, { useEffect, useState, useCallback } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  RefreshCw
} from 'lucide-react';

interface SpotWeatherPanelProps {
  lat: number;
  lng: number;
}

interface CurrentWeather {
  time: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
}

interface HourlyForecastItem {
  time: string;
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
}

interface WeatherData {
  current: CurrentWeather;
  forecast: HourlyForecastItem[];
}

function formatCompassDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
  return dirs[idx];
}

function formatHourLabel(isoTime: string): string {
  // Open-Meteo returns local Asia/Singapore ISO strings like "2026-11-24T12:00"
  const parts = isoTime.split('T');
  return parts[1] ? parts[1].slice(0, 5) : isoTime;
}

function describeWmoCode(code: number): {
  label: string;
  shortLabel: string;
  Icon: React.ComponentType<{ className?: string }>;
} {
  if (code === 0) {
    return { label: 'Clear sky', shortLabel: 'Clear', Icon: Sun };
  }
  if (code === 1 || code === 2) {
    return { label: 'Partly cloudy', shortLabel: 'Partly cloudy', Icon: CloudSun };
  }
  if (code === 3) {
    return { label: 'Overcast', shortLabel: 'Overcast', Icon: Cloud };
  }
  if (code === 45 || code === 48) {
    return { label: 'Mist / fog', shortLabel: 'Mist', Icon: CloudFog };
  }
  if (code >= 51 && code <= 57) {
    return { label: 'Drizzle', shortLabel: 'Drizzle', Icon: CloudDrizzle };
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return { label: 'Rain showers', shortLabel: 'Showers', Icon: CloudRain };
  }
  if (code >= 95 && code <= 99) {
    return { label: 'Thunderstorm', shortLabel: 'Storm', Icon: CloudLightning };
  }
  return { label: 'Cloudy', shortLabel: 'Cloudy', Icon: Cloud };
}

export const SpotWeatherPanel: React.FC<SpotWeatherPanelProps> = ({ lat, lng }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState<number>(0);

  const handleRetry = useCallback(() => {
    setRetryToken((n) => n + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchWeather() {
      setIsLoading(true);
      setError(null);

      try {
        const url = new URL('https://api.open-meteo.com/v1/forecast');
        url.searchParams.set('latitude', lat.toFixed(5));
        url.searchParams.set('longitude', lng.toFixed(5));
        url.searchParams.set(
          'current',
          'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m'
        );
        url.searchParams.set(
          'hourly',
          'temperature_2m,precipitation_probability,weather_code,wind_speed_10m'
        );
        url.searchParams.set('forecast_hours', '4');
        url.searchParams.set('timezone', 'Asia/Singapore');

        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Weather API responded with status ${res.status}`);
        }

        const data = await res.json();
        const cur = data?.current;
        const hourly = data?.hourly;

        if (!cur || !hourly || !Array.isArray(hourly.time)) {
          throw new Error('Unexpected weather payload structure');
        }

        const current: CurrentWeather = {
          time: String(cur.time ?? ''),
          temperature: Number(cur.temperature_2m ?? 0),
          humidity: Number(cur.relative_humidity_2m ?? 0),
          precipitation: Number(cur.precipitation ?? 0),
          weatherCode: Number(cur.weather_code ?? 0),
          windSpeed: Number(cur.wind_speed_10m ?? 0),
          windDirection: Number(cur.wind_direction_10m ?? 0)
        };

        // Pick the next 3 hourly forecast slots after the current hour (fallback to indices 1..3)
        const allSlots: HourlyForecastItem[] = hourly.time.map(
          (t: string, idx: number) => ({
            time: t,
            temperature: Number(hourly.temperature_2m?.[idx] ?? 0),
            precipitationProbability: Number(
              hourly.precipitation_probability?.[idx] ?? 0
            ),
            weatherCode: Number(hourly.weather_code?.[idx] ?? 0),
            windSpeed: Number(hourly.wind_speed_10m?.[idx] ?? 0)
          })
        );

        const upcoming = allSlots.slice(1, 4);
        const forecast = upcoming.length > 0 ? upcoming : allSlots.slice(0, 3);

        setWeather({ current, forecast });
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        setWeather(null);
        setError('Unable to load live weather for these coordinates.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchWeather();

    return () => {
      controller.abort();
    };
  }, [lat, lng, retryToken]);

  const currentMeta = weather ? describeWmoCode(weather.current.weatherCode) : null;
  const CurrentIcon = currentMeta?.Icon;

  return (
    <div className="border-t border-slate-100 pt-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-slate-900">
          Weather &amp; 3-Hour Forecast
        </h3>
        <span className="text-[11px] text-slate-400">Open-Meteo · SGT</span>
      </div>

      {isLoading && (
        <div className="space-y-2.5">
          <div className="h-12 rounded-lg bg-slate-100" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 rounded-lg bg-slate-100" />
            <div className="h-16 rounded-lg bg-slate-100" />
            <div className="h-16 rounded-lg bg-slate-100" />
          </div>
        </div>
      )}

      {!isLoading && error && (
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
          <span>{error}</span>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-1 font-medium text-sky-700 hover:underline shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {!isLoading && !error && weather && currentMeta && CurrentIcon && (
        <div className="space-y-2.5">
          {/* Current Conditions */}
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              <CurrentIcon className="w-5 h-5 text-sky-700 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-slate-900 tabular-nums">
                    {weather.current.temperature.toFixed(1)}°C
                  </span>
                  <span className="text-xs font-medium text-slate-700 truncate">
                    {currentMeta.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 tabular-nums">
                  <span>Humidity {Math.round(weather.current.humidity)}%</span>
                  <span aria-hidden="true">·</span>
                  <span>Rain {weather.current.precipitation.toFixed(1)} mm</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 tabular-nums">
                <Wind className="w-3.5 h-3.5 text-slate-500" />
                <span>{Math.round(weather.current.windSpeed)} km/h</span>
              </div>
              <div className="text-[11px] text-slate-500">
                {formatCompassDirection(weather.current.windDirection)} wind
              </div>
            </div>
          </div>

          {/* 3-Hour Forecast Strip */}
          {weather.forecast.length > 0 && (
            <div className="grid grid-cols-3 divide-x divide-slate-200 border border-slate-200 rounded-lg bg-white">
              {weather.forecast.map((slot) => {
                const slotMeta = describeWmoCode(slot.weatherCode);
                const SlotIcon = slotMeta.Icon;
                return (
                  <div
                    key={slot.time}
                    className="px-2.5 py-2 flex flex-col items-start gap-1"
                  >
                    <span className="font-mono text-[11px] font-medium text-slate-500 tabular-nums">
                      {formatHourLabel(slot.time)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <SlotIcon className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                      <span className="text-xs font-bold text-slate-900 tabular-nums">
                        {Math.round(slot.temperature)}°C
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 tabular-nums">
                      <Droplets className="w-3 h-3 text-sky-600 shrink-0" />
                      <span>{Math.round(slot.precipitationProbability)}%</span>
                      <span aria-hidden="true">·</span>
                      <span>{Math.round(slot.windSpeed)} km/h</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
