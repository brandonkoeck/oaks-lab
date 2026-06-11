'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Pokemon } from '@/lib/pokemonApi'
import { TYPE_COLORS, PokemonType } from '@/lib/typeData'
import { STAT_MAX, BST_MAX, statColor } from '@/lib/stats'

const PAGE_SIZE = 25

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type as PokemonType] ?? '#777'
  return (
    <span
      style={{ backgroundColor: color, textShadow: '0 1px 1px rgba(0,0,0,0.5)' }}
      className="px-2 py-0.5 rounded text-white text-xs font-bold uppercase tracking-wide"
    >
      {type}
    </span>
  )
}

function StatCell({ value, max, isBst = false }: { value: number; max: number; isBst?: boolean }) {
  const pct = Math.min(100, (value / max) * 100)
  const color = isBst ? '#60a5fa' : statColor(value)
  return (
    <td className="py-2 px-1 text-center" style={{ minWidth: '46px' }}>
      <div className="text-xs font-medium mb-1" style={{ color: isBst ? '#a0b4cc' : '#e0e8f0' }}>
        {value}
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#111827' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </td>
  )
}

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const start = Math.max(1, page - 2)
  const end = Math.min(total, page + 2)
  const visible = Array.from({ length: end - start + 1 }, (_, i) => start + i)
  const btnBase = 'h-8 rounded text-sm font-medium transition-colors cursor-pointer disabled:cursor-default'
  const btnStyle = { backgroundColor: '#2a3a5a', color: '#e0e8f0' }
  const activeStyle = { backgroundColor: '#4a6fa5', color: '#ffffff' }

  return (
    <div className="flex items-center gap-1 justify-center mt-6 flex-wrap">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className={`${btnBase} px-3 disabled:opacity-30`} style={btnStyle}>Prev</button>
      {start > 1 && <>
        <button onClick={() => onChange(1)} className={`${btnBase} w-8`} style={btnStyle}>1</button>
        {start > 2 && <span className="text-sm" style={{ color: '#7a8caa' }}>…</span>}
      </>}
      {visible.map(p => (
        <button key={p} onClick={() => onChange(p)} className={`${btnBase} w-8`}
          style={p === page ? activeStyle : btnStyle}>{p}</button>
      ))}
      {end < total && <>
        {end < total - 1 && <span className="text-sm" style={{ color: '#7a8caa' }}>…</span>}
        <button onClick={() => onChange(total)} className={`${btnBase} w-8`} style={btnStyle}>{total}</button>
      </>}
      <button onClick={() => onChange(page + 1)} disabled={page === total}
        className={`${btnBase} px-3 disabled:opacity-30`} style={btnStyle}>Next</button>
    </div>
  )
}

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="py-3 px-1 text-center font-semibold text-xs" style={{ color: '#a0b4cc' }}>{children}</th>
)

export default function PokemonList({ pokemon }: { pokemon: Pokemon[] }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return pokemon
    return pokemon.filter(p =>
      p.displayName.toLowerCase().includes(q) ||
      p.name.includes(q) ||
      p.types.some(t => t.toLowerCase().startsWith(q))
    )
  }, [pokemon, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <input
        type="text"
        placeholder="Pokémon name or type"
        value={query}
        onChange={e => { setQuery(e.target.value); setPage(1) }}
        className="w-full px-4 py-2.5 rounded text-sm outline-none mb-2"
        style={{ backgroundColor: '#2a3a5a', color: '#e0e8f0', border: '1px solid #3d5080' }}
      />
      <p className="text-xs mb-3" style={{ color: '#7a8caa' }}>
        {filtered.length.toLocaleString()} Pokémon{query ? ` matching "${query}"` : ''}
      </p>

      <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #2d3d60' }}>
        <table className="w-full text-sm" style={{ minWidth: '700px' }}>
          <thead>
            <tr style={{ backgroundColor: '#2a3a5a' }}>
              <th className="py-3 px-4 text-left font-semibold text-xs w-14" style={{ color: '#a0b4cc' }}>#</th>
              <th className="py-3 px-4 text-left font-semibold text-xs" style={{ color: '#a0b4cc' }}>Pokémon</th>
              <th className="py-3 px-4 text-left font-semibold text-xs" style={{ color: '#a0b4cc' }}>Type</th>
              <TH>HP</TH>
              <TH>Atk</TH>
              <TH>Def</TH>
              <TH>SAt</TH>
              <TH>SDf</TH>
              <TH>Spd</TH>
              <TH>BST</TH>
            </tr>
          </thead>
          <tbody>
            {slice.map((p, i) => (
              <tr key={p.name}
                style={{ backgroundColor: i % 2 === 0 ? '#1e2a42' : '#1a2438' }}
                className="hover:brightness-125 transition-all">
                <td className="py-2 px-4 font-mono text-xs" style={{ color: '#7a8caa' }}>
                  #{p.speciesId}
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center gap-2">
                    {p.sprite ? (
                      <Image src={p.sprite} alt={p.displayName} width={40} height={40} unoptimized className="pixelated" />
                    ) : (
                      <div className="w-10 h-10 rounded" style={{ backgroundColor: '#2a3a5a' }} />
                    )}
                    <Link href={`/pokedex/${p.name}`} className="font-medium hover:underline whitespace-nowrap"
                      style={{ color: '#6eb5ff' }}>
                      {p.displayName}
                    </Link>
                  </div>
                </td>
                <td className="py-2 px-4">
                  <div className="flex gap-1 flex-wrap" style={{ minWidth: '90px' }}>
                    {p.types.map(t => <TypeBadge key={t} type={t} />)}
                  </div>
                </td>
                <StatCell value={p.stats.hp}             max={STAT_MAX.hp} />
                <StatCell value={p.stats.attack}         max={STAT_MAX.attack} />
                <StatCell value={p.stats.defense}        max={STAT_MAX.defense} />
                <StatCell value={p.stats.specialAttack}  max={STAT_MAX.specialAttack} />
                <StatCell value={p.stats.specialDefense} max={STAT_MAX.specialDefense} />
                <StatCell value={p.stats.speed}          max={STAT_MAX.speed} />
                <StatCell value={p.stats.total}          max={BST_MAX} isBst />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} total={totalPages} onChange={setPage} />
    </div>
  )
}
