'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import type { Pokemon } from '@/lib/pokemonApi'
import { STAT_MAX, BST_MAX, statColor, bstColor, STAT_LABELS } from '@/lib/stats'

const statKeys = Object.keys(STAT_LABELS) as (keyof typeof STAT_LABELS)[]

function CompareStats({ pokemon, onBack }: { pokemon: Pokemon; onBack: () => void }) {
  return (
    <div className="rounded-xl p-5 relative flex flex-col justify-center" style={{ backgroundColor: '#1e2a42', border: '1px solid #2d3d60' }}>
      {/* Back button pinned top-left */}
      <button
        onClick={onBack}
        className="absolute top-2.5 left-3 text-xs hover:underline cursor-pointer"
        style={{ color: '#6eb5ff' }}
      >
        Back
      </button>

      {/* Header — same height as "Base Stats" h2 */}
      <h2 className="text-sm font-semibold mb-4 text-center flex items-center justify-center gap-1.5" style={{ color: '#a0b4cc' }}>
        {(pokemon.officialArtwork ?? pokemon.sprite) && (
          <Image
            src={pokemon.officialArtwork ?? pokemon.sprite!}
            alt={pokemon.displayName}
            width={16}
            height={16}
            unoptimized
            className="object-contain shrink-0"
          />
        )}
        {pokemon.displayName}
      </h2>

      {/* Stats grid — identical to Base Stats card */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-3">
        {statKeys.map(key => {
          const value = pokemon.stats[key]
          const max = STAT_MAX[key]
          const pct = Math.min(100, (value / max) * 100)
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: '#a0b4cc' }}>{STAT_LABELS[key]}:</span>
                <span className="font-mono font-medium" style={{ color: '#e0e8f0' }}>{value}</span>
              </div>
              <div className="h-2.5 overflow-hidden" style={{ backgroundColor: '#111827' }}>
                <div className="h-full" style={{ width: `${pct}%`, backgroundColor: statColor(value) }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Total */}
      <div className="mt-4 pt-3" style={{ borderTop: '1px solid #2d3d60' }}>
        <div className="flex justify-between text-xs mb-1">
          <span className="font-semibold" style={{ color: '#a0b4cc' }}>Total:</span>
          <span className="font-mono font-semibold" style={{ color: bstColor(pokemon.stats.total) }}>
            {pokemon.stats.total}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden" style={{ backgroundColor: '#111827' }}>
          <div className="h-full"
            style={{ width: `${Math.min(100, (pokemon.stats.total / BST_MAX) * 100)}%`, backgroundColor: bstColor(pokemon.stats.total) }} />
        </div>
      </div>
    </div>
  )
}

export default function ComparePanel({
  allPokemon,
  currentName,
}: {
  allPokemon: Pokemon[]
  currentName: string
}) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Pokemon | null>(null)

  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return []
    return allPokemon
      .filter(p => p.name !== currentName)
      .filter(p =>
        p.displayName.toLowerCase().includes(q) ||
        p.name.includes(q) ||
        p.types.some(t => t.toLowerCase().startsWith(q))
      )
      .slice(0, 20)
  }, [allPokemon, query, currentName])

  if (selected) {
    return <CompareStats pokemon={selected} onBack={() => { setSelected(null); setQuery('') }} />
  }

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: '#1e2a42', border: '1px solid #2d3d60' }}>
      <h2 className="text-sm font-semibold mb-4 text-center" style={{ color: '#a0b4cc' }}>
        Compare
      </h2>

      <input
        type="text"
        placeholder="Search Pokémon..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full px-3 py-1.5 rounded text-xs outline-none mb-2"
        style={{ backgroundColor: '#2a3a5a', color: '#e0e8f0', border: '1px solid #3d5080' }}
      />

      <div className="overflow-y-auto" style={{ maxHeight: '180px' }}>
        {query.trim() && results.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: '#7a8caa' }}>No results</p>
        )}
        {results.map(p => (
          <button
            key={p.name}
            onClick={() => setSelected(p)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all hover:brightness-125 cursor-pointer"
            style={{ backgroundColor: 'transparent' }}
          >
            {(p.officialArtwork ?? p.sprite) && (
              <Image
                src={p.officialArtwork ?? p.sprite!}
                alt={p.displayName}
                width={22}
                height={22}
                unoptimized
                className="object-contain shrink-0"
              />
            )}
            <span className="text-xs font-medium flex-1 min-w-0 truncate" style={{ color: '#e0e8f0' }}>
              {p.displayName}
            </span>
          </button>
        ))}
      </div>

      {!query.trim() && (
        <p className="text-xs text-center mt-3" style={{ color: '#7a8caa' }}>
          Type a name or type to search
        </p>
      )}
    </div>
  )
}
