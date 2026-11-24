import { useState, useEffect, useCallback } from 'react';
import { FishingGroundSpec } from '../data/fishingGrounds';

export type WaterCategory = 'freshwater' | 'saltwater';

export interface CatchLogEntry {
  id: string;
  spotId: string;
  spotName: string;
  waterCategory: WaterCategory;
  species: string;
  quantity: number;
  rating: number;
  recordedAt: number;
}

export interface NewCatchInput {
  spotId: string;
  spotName: string;
  waterCategory: WaterCategory;
  species: string;
  quantity: number;
  rating: number;
}

const STORAGE_KEY = 'sg_castmap_catch_log_v1';

export function inferWaterCategory(
  ground: Pick<FishingGroundSpec, 'agency' | 'waterType'>
): WaterCategory {
  if (
    ground.agency === 'PUB' ||
    ground.waterType === 'Freshwater Reservoir' ||
    ground.waterType === 'Waterway / Canal'
  ) {
    return 'freshwater';
  }
  return 'saltwater';
}

function loadStoredEntries(): CatchLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is CatchLogEntry =>
          Boolean(item) &&
          typeof item.id === 'string' &&
          typeof item.spotId === 'string' &&
          typeof item.spotName === 'string' &&
          (item.waterCategory === 'freshwater' ||
            item.waterCategory === 'saltwater') &&
          typeof item.species === 'string' &&
          typeof item.quantity === 'number' &&
          typeof item.rating === 'number' &&
          typeof item.recordedAt === 'number'
      )
      .sort((a, b) => b.recordedAt - a.recordedAt);
  } catch {
    return [];
  }
}

export function useCatchLog() {
  const [entries, setEntries] = useState<CatchLogEntry[]>(loadStoredEntries);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Ignore storage quota errors
    }
  }, [entries]);

  const addEntry = useCallback((input: NewCatchInput) => {
    const cleanSpecies = input.species.trim();
    if (!cleanSpecies) return;

    const cleanQuantity = Math.max(1, Math.min(999, Math.round(input.quantity || 1)));
    const cleanRating = Math.max(1, Math.min(5, Math.round(input.rating || 5)));

    const newEntry: CatchLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      spotId: input.spotId,
      spotName: input.spotName,
      waterCategory: input.waterCategory,
      species: cleanSpecies,
      quantity: cleanQuantity,
      rating: cleanRating,
      recordedAt: Date.now()
    };

    setEntries((prev) => [newEntry, ...prev]);
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    entries,
    addEntry,
    deleteEntry
  };
}
