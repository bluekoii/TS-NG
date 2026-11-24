import React, { useState, useMemo } from 'react';
import { X, Trash2, Star, Plus, Minus, MapPin } from 'lucide-react';
import { ResolvedFishingGround } from '../data/fishingGrounds';
import {
  CatchLogEntry,
  NewCatchInput,
  WaterCategory,
  inferWaterCategory
} from '../hooks/useCatchLog';

interface CatchLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: CatchLogEntry[];
  grounds: ResolvedFishingGround[];
  onAddEntry: (input: NewCatchInput) => void;
  onDeleteEntry: (id: string) => void;
  onSelectSpot: (ground: ResolvedFishingGround) => void;
}

function formatDateTime(ts: number): string {
  try {
    return new Intl.DateTimeFormat('en-SG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(ts));
  } catch {
    return '';
  }
}

export const CatchLogModal: React.FC<CatchLogModalProps> = ({
  isOpen,
  onClose,
  entries,
  grounds,
  onAddEntry,
  onDeleteEntry,
  onSelectSpot
}) => {
  const [waterFilter, setWaterFilter] = useState<'all' | WaterCategory>('all');
  const [selectedSpotId, setSelectedSpotId] = useState<string>('');
  const [waterCategory, setWaterCategory] = useState<WaterCategory>('freshwater');
  const [species, setSpecies] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [rating, setRating] = useState<number>(4);
  const [formError, setFormError] = useState<string | null>(null);

  const legalGrounds = useMemo(
    () => grounds.filter((g) => g.agency !== 'Prohibited'),
    [grounds]
  );

  const filteredEntries = useMemo(() => {
    if (waterFilter === 'all') return entries;
    return entries.filter((e) => e.waterCategory === waterFilter);
  }, [entries, waterFilter]);

  const summary = useMemo(() => {
    const count = filteredEntries.length;
    const totalFish = filteredEntries.reduce((acc, item) => acc + item.quantity, 0);
    const avgRating =
      count > 0
        ? (
            filteredEntries.reduce((acc, item) => acc + item.rating, 0) / count
          ).toFixed(1)
        : '—';
    return { count, totalFish, avgRating };
  }, [filteredEntries]);

  const freshwaterCount = useMemo(
    () => entries.filter((e) => e.waterCategory === 'freshwater').length,
    [entries]
  );
  const saltwaterCount = useMemo(
    () => entries.filter((e) => e.waterCategory === 'saltwater').length,
    [entries]
  );

  if (!isOpen) return null;

  const activeSpot =
    legalGrounds.find((g) => g.id === selectedSpotId) || legalGrounds[0] || null;

  const handleSpotChange = (spotId: string) => {
    setSelectedSpotId(spotId);
    const found = legalGrounds.find((g) => g.id === spotId);
    if (found) {
      setWaterCategory(inferWaterCategory(found));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSpot) {
      setFormError('Wait for fishing grounds to finish loading.');
      return;
    }
    if (!species.trim()) {
      setFormError('Enter the fish species caught.');
      return;
    }
    setFormError(null);
    onAddEntry({
      spotId: activeSpot.id,
      spotName: activeSpot.name,
      waterCategory,
      species: species.trim(),
      quantity,
      rating
    });
    setSpecies('');
    setQuantity(1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catch-log-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h2 id="catch-log-title" className="text-lg font-bold text-slate-900">
              Personal Catch Log
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              Saved locally in browser storage · {freshwaterCount} freshwater ·{' '}
              {saltwaterCount} saltwater
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close catch log"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Quick Log Form */}
          <form
            onSubmit={handleSubmit}
            className="border border-slate-200 rounded-lg p-4 bg-slate-50/70 space-y-3"
          >
            <div className="text-xs font-semibold text-slate-900">
              Record New Catch
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="catch-modal-spot"
                  className="block text-[11px] font-medium text-slate-600 mb-1"
                >
                  Fishing Ground
                </label>
                <select
                  id="catch-modal-spot"
                  value={activeSpot?.id || ''}
                  onChange={(e) => handleSpotChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                >
                  {legalGrounds.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.agency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-[11px] font-medium text-slate-600 mb-1">
                  Water Type
                </span>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/70 rounded-lg">
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
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5">
                <label
                  htmlFor="catch-modal-species"
                  className="block text-[11px] font-medium text-slate-600 mb-1"
                >
                  Fish Species
                </label>
                <input
                  id="catch-modal-species"
                  type="text"
                  list="catch-modal-species-list"
                  value={species}
                  onChange={(e) => {
                    setSpecies(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="e.g. Peacock Bass, Barramundi"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
                {activeSpot && (
                  <datalist id="catch-modal-species-list">
                    {activeSpot.commonSpecies.map((sp) => (
                      <option key={sp} value={sp} />
                    ))}
                  </datalist>
                )}
              </div>

              <div className="sm:col-span-3">
                <span className="block text-[11px] font-medium text-slate-600 mb-1">
                  Quantity
                </span>
                <div className="inline-flex w-full items-center justify-between border border-slate-200 rounded-lg bg-white overflow-hidden">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2.5 py-2 text-slate-600 hover:bg-slate-100 cursor-pointer"
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
                      setQuantity(
                        Math.max(1, Math.min(999, Number(e.target.value) || 1))
                      )
                    }
                    className="w-10 text-center text-xs font-semibold text-slate-900 tabular-nums focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => Math.min(999, q + 1))}
                    className="px-2.5 py-2 text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <span className="block text-[11px] font-medium text-slate-600 mb-1">
                  Rating
                </span>
                <div className="flex items-center gap-0.5 py-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} out of 5`}
                      className="p-0.5 cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Save Catch
                </button>
              </div>
            </div>

            {formError && <p className="text-xs text-red-600">{formError}</p>}
          </form>

          {/* Segregated Filter & Summary Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
              {(
                [
                  { id: 'all', label: `All (${entries.length})` },
                  { id: 'freshwater', label: `Freshwater (${freshwaterCount})` },
                  { id: 'saltwater', label: `Saltwater (${saltwaterCount})` }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setWaterFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    waterFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 tabular-nums">
              <span>
                <strong className="text-slate-900">{summary.count}</strong> logs
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong className="text-slate-900">{summary.totalFish}</strong> fish caught
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Avg rating <strong className="text-slate-900">{summary.avgRating}/5</strong>
              </span>
            </div>
          </div>

          {/* Entries List */}
          {filteredEntries.length === 0 ? (
            <div className="py-10 text-center space-y-1.5">
              <p className="text-sm font-semibold text-slate-900">
                No {waterFilter === 'all' ? '' : `${waterFilter} `}catches logged yet
              </p>
              <p className="text-xs text-slate-500">
                Record your catch above or select any fishing ground on the map to log species, quantity, and rating.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {filteredEntries.map((entry) => {
                const matchedGround = grounds.find((g) => g.id === entry.spotId);
                return (
                  <div
                    key={entry.id}
                    className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2.5 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900">
                          {entry.species}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
                          ×{entry.quantity}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            entry.waterCategory === 'freshwater'
                              ? 'text-sky-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {entry.waterCategory === 'freshwater'
                            ? 'Freshwater'
                            : 'Saltwater'}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 flex-wrap tabular-nums">
                        {matchedGround ? (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSpot(matchedGround);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 text-slate-700 hover:text-sky-700 hover:underline cursor-pointer"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>{entry.spotName}</span>
                          </button>
                        ) : (
                          <span>{entry.spotName}</span>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>{entry.rating}/5 ★</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatDateTime(entry.recordedAt)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteEntry(entry.id)}
                      aria-label={`Delete ${entry.species} catch`}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
