import React, { useState, useEffect, useMemo } from 'react';
import { Star, Trash2, Plus, Minus, BookOpen } from 'lucide-react';
import { ResolvedFishingGround } from '../data/fishingGrounds';
import {
  CatchLogEntry,
  NewCatchInput,
  WaterCategory,
  inferWaterCategory
} from '../hooks/useCatchLog';

interface SpotCatchLogProps {
  ground: ResolvedFishingGround;
  entries: CatchLogEntry[];
  onAddEntry: (input: NewCatchInput) => void;
  onDeleteEntry: (id: string) => void;
  onOpenFullLog: () => void;
}

function formatShortTimestamp(ts: number): string {
  try {
    return new Intl.DateTimeFormat('en-SG', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(ts));
  } catch {
    return '';
  }
}

export const SpotCatchLog: React.FC<SpotCatchLogProps> = ({
  ground,
  entries,
  onAddEntry,
  onDeleteEntry,
  onOpenFullLog
}) => {
  const defaultCategory = inferWaterCategory(ground);
  const [waterCategory, setWaterCategory] = useState<WaterCategory>(defaultCategory);
  const [species, setSpecies] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [rating, setRating] = useState<number>(4);
  const [filterWater, setFilterWater] = useState<'all' | WaterCategory>('all');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setWaterCategory(inferWaterCategory(ground));
    setSpecies('');
    setQuantity(1);
    setRating(4);
    setFilterWater('all');
    setFormError(null);
  }, [ground.id]);

  const spotEntries = useMemo(
    () => entries.filter((e) => e.spotId === ground.id),
    [entries, ground.id]
  );

  const filteredSpotEntries = useMemo(() => {
    if (filterWater === 'all') return spotEntries;
    return spotEntries.filter((e) => e.waterCategory === filterWater);
  }, [spotEntries, filterWater]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!species.trim()) {
      setFormError('Enter the fish species caught.');
      return;
    }
    setFormError(null);
    onAddEntry({
      spotId: ground.id,
      spotName: ground.name,
      waterCategory,
      species: species.trim(),
      quantity,
      rating
    });
    setSpecies('');
    setQuantity(1);
  };

  const datalistId = `species-options-${ground.id}`;

  return (
    <div className="border-t border-slate-100 pt-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-slate-900">
          Catch Log ({spotEntries.length})
        </h3>
        <button
          type="button"
          onClick={onOpenFullLog}
          className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:underline cursor-pointer"
        >
          <BookOpen className="w-3 h-3" />
          <span>All Catches</span>
        </button>
      </div>

      {/* Record Catch Form */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setWaterCategory('freshwater')}
            className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              waterCategory === 'freshwater'
                ? 'bg-white text-sky-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Freshwater
          </button>
          <button
            type="button"
            onClick={() => setWaterCategory('saltwater')}
            className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              waterCategory === 'saltwater'
                ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saltwater
          </button>
        </div>

        <div>
          <label htmlFor={`species-input-${ground.id}`} className="sr-only">
            Fish species caught
          </label>
          <input
            id={`species-input-${ground.id}`}
            type="text"
            list={datalistId}
            value={species}
            onChange={(e) => {
              setSpecies(e.target.value);
              if (formError) setFormError(null);
            }}
            placeholder="Species (e.g. Peacock Bass, Barramundi)"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
          />
          <datalist id={datalistId}>
            {ground.commonSpecies.map((sp) => (
              <option key={sp} value={sp} />
            ))}
          </datalist>
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Qty</span>
            <div className="inline-flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                min={1}
                max={999}
                aria-label="Catch quantity"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Math.min(999, Number(e.target.value) || 1)))
                }
                className="w-10 text-center text-xs font-semibold text-slate-900 tabular-nums focus:outline-none"
              />
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(999, q + 1))}
                className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 1-5 Star Rating */}
          <div className="flex items-center gap-0.5" role="group" aria-label="Spot catch rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} out of 5`}
                className="p-1 cursor-pointer"
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    star <= rating
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-300 hover:text-slate-400'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {formError && (
          <p className="text-xs text-red-600">{formError}</p>
        )}

        <button
          type="submit"
          className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Save Catch
        </button>
      </form>

      {/* Recorded Catches at this Spot */}
      {spotEntries.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'freshwater', label: 'Freshwater' },
                { id: 'saltwater', label: 'Saltwater' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterWater(tab.id)}
                className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                  filterWater === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filteredSpotEntries.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">
              No {filterWater} catches logged at this spot yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white">
              {filteredSpotEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="px-3 py-2.5 flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {entry.species}
                      </span>
                      <span className="text-xs font-mono font-medium text-slate-700 tabular-nums shrink-0">
                        ×{entry.quantity}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 tabular-nums flex-wrap">
                      <span
                        className={
                          entry.waterCategory === 'freshwater'
                            ? 'text-sky-700 font-medium'
                            : 'text-emerald-700 font-medium'
                        }
                      >
                        {entry.waterCategory === 'freshwater'
                          ? 'Freshwater'
                          : 'Saltwater'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{entry.rating}/5 ★</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatShortTimestamp(entry.recordedAt)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteEntry(entry.id)}
                    aria-label={`Delete ${entry.species} catch`}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
