'use client'

import { useState } from 'react'
import { TYPES, TYPE_COLORS, PokemonType, calculateEffectiveness } from '@/lib/typeData'

const MULTIPLIER_LABEL: Record<number, string> = {
  4: '4×',
  2: '2×',
  0.5: '½×',
  0.25: '¼×',
  0: '0×',
}

interface Section {
  label: string
  multipliers: number[]
  colorClass: string
  borderClass: string
  headerClass: string
}

const SECTIONS: Section[] = [
  {
    label: 'Weaknesses',
    multipliers: [4, 2],
    colorClass: 'bg-red-50 dark:bg-red-950/40',
    borderClass: 'border-red-200 dark:border-red-800',
    headerClass: 'text-red-600 dark:text-red-400',
  },
  {
    label: 'Resistances',
    multipliers: [0.25, 0.5],
    colorClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    headerClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Immunities',
    multipliers: [0],
    colorClass: 'bg-zinc-100 dark:bg-zinc-800/40',
    borderClass: 'border-zinc-200 dark:border-zinc-700',
    headerClass: 'text-zinc-500 dark:text-zinc-400',
  },
]

function TypeBadge({ type }: { type: PokemonType }) {
  return (
    <span
      style={{ backgroundColor: TYPE_COLORS[type], textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
      className="px-3 py-1 rounded-full text-white text-sm font-semibold"
    >
      {type}
    </span>
  )
}

export default function TypeChecker() {
  const [selected, setSelected] = useState<PokemonType[]>([])

  function handleTypeClick(type: PokemonType) {
    setSelected(prev => {
      if (prev.includes(type)) return prev.filter(t => t !== type)
      if (prev.length >= 2) return [prev[1], type]
      return [...prev, type]
    })
  }

  const effectiveness = selected.length > 0 ? calculateEffectiveness(selected) : null

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
          Select up to 2 types
        </p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(type => {
            const isSelected = selected.includes(type)
            return (
              <button
                key={type}
                onClick={() => handleTypeClick(type)}
                style={{
                  backgroundColor: TYPE_COLORS[type],
                  textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                  outline: isSelected ? `3px solid ${TYPE_COLORS[type]}` : undefined,
                  outlineOffset: isSelected ? '2px' : undefined,
                }}
                className={`px-3 py-1.5 rounded-full text-white text-sm font-semibold transition-all ${
                  isSelected ? 'scale-110 opacity-100' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {type}
              </button>
            )
          })}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Checking:</span>
          {selected.map(type => (
            <TypeBadge key={type} type={type} />
          ))}
          <button
            onClick={() => setSelected([])}
            className="ml-auto text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {effectiveness ? (
        <div className="space-y-4">
          {SECTIONS.map(({ label, multipliers, colorClass, borderClass, headerClass }) => {
            const matches = effectiveness
              .filter(e => multipliers.includes(e.multiplier))
              .sort((a, b) => b.multiplier - a.multiplier)
            if (matches.length === 0) return null
            return (
              <div key={label} className={`rounded-xl border p-4 ${colorClass} ${borderClass}`}>
                <h2 className={`text-xs font-bold uppercase tracking-widest mb-3 ${headerClass}`}>
                  {label}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {matches.map(({ type, multiplier }) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <TypeBadge type={type} />
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 tabular-nums">
                        {MULTIPLIER_LABEL[multiplier]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-center text-zinc-400 dark:text-zinc-500 py-16 text-sm">
          Select a type above to see its weaknesses and resistances.
        </p>
      )}
    </div>
  )
}
