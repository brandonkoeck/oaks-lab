import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getAllPokemon, getPokemon } from '@/lib/pokemonApi'
import { calculateEffectiveness, TYPE_COLORS, PokemonType } from '@/lib/typeData'
import { STAT_MAX, BST_MAX, statColor, bstColor, STAT_LABELS } from '@/lib/stats'
import ComparePanel from '@/app/components/ComparePanel'

export async function generateStaticParams() {
  const pokemon = await getAllPokemon()
  return pokemon.map(p => ({ name: p.name }))
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const pokemon = await getPokemon(name)
  if (!pokemon) return {}
  return {
    title: `${pokemon.displayName} — Pokédex`,
    description: `Type weaknesses, resistances, abilities, and base stats for ${pokemon.displayName} (${pokemon.types.join('/')}).`,
  }
}

const WEAKNESS_ROWS = [
  { mult: 4,    label: '4×',  rowBg: '#4a1010', labelBg: '#6b1a1a' },
  { mult: 2,    label: '2×',  rowBg: '#3a1a0a', labelBg: '#5a2a10' },
  { mult: 0.5,  label: '½',   rowBg: '#0a2818', labelBg: '#0f3820' },
  { mult: 0.25, label: '¼',   rowBg: '#071e12', labelBg: '#0c2e1a' },
  { mult: 0,    label: '0×',  rowBg: '#141422', labelBg: '#1e1e36' },
]

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type as PokemonType] ?? '#777'
  return (
    <span
      style={{ backgroundColor: color, textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000', boxShadow: '0 3px 0 rgba(0,0,0,0.35), 0 4px 6px rgba(0,0,0,0.3)' }}
      className="px-1.5 py-px rounded text-white text-xs font-semibold uppercase tracking-wide"
    >
      {type}
    </span>
  )
}

const statKeys = Object.keys(STAT_LABELS) as (keyof typeof STAT_LABELS)[]

export default async function PokemonPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const [pokemon, allPokemon] = await Promise.all([getPokemon(name), getAllPokemon()])
  if (!pokemon) notFound()

  const effectiveness = calculateEffectiveness(pokemon.types)
  const rows = WEAKNESS_ROWS.map(row => ({
    ...row,
    types: effectiveness.filter(e => e.multiplier === row.mult).map(e => e.type),
  })).filter(row => row.types.length > 0)

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="text-sm hover:underline mb-4 inline-block"
        style={{ color: '#6eb5ff' }}
      >
        ← Back to Pokédex
      </Link>

      {/* Page header — name above everything */}
      <div className="mb-6">
        <p className="text-sm font-mono mb-1" style={{ color: '#7a8caa' }}>#{pokemon.speciesId}</p>
        <h1 className="text-4xl font-bold" style={{ color: '#e0e8f0' }}>{pokemon.displayName}</h1>
      </div>

      <div className="grid gap-4 items-start lg:grid-cols-[2fr_3fr]">

        {/* ── Left column ── */}
        <div className="space-y-4">

          {/* Sprite + types card */}
          <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#1e2a42', border: '1px solid #2d3d60' }}>
            {pokemon.officialArtwork ? (
              <div className="relative w-48 h-48 mx-auto mb-4">
                <Image
                  src={pokemon.officialArtwork}
                  alt={pokemon.displayName}
                  fill
                  priority
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : pokemon.sprite ? (
              <Image
                src={pokemon.sprite}
                alt={pokemon.displayName}
                width={120}
                height={120}
                unoptimized
                className="pixelated mx-auto mb-4"
              />
            ) : (
              <div className="w-48 h-48 rounded-lg mx-auto mb-4" style={{ backgroundColor: '#2a3a5a' }} />
            )}
            <p className="text-xs mb-2 truncate" title={`${pokemon.displayName}'s Type`} style={{ color: '#7a8caa' }}>{pokemon.displayName}&apos;s Type</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
            </div>
          </div>

          {/* Compare + Base Stats side by side */}
          <div className="grid grid-cols-2 gap-4">
          <ComparePanel allPokemon={allPokemon} currentName={pokemon.name} />

          {/* Base Stats card */}
          <div className="rounded-xl p-5" style={{ backgroundColor: '#1e2a42', border: '1px solid #2d3d60' }}>
            <h2 className="text-sm font-semibold mb-4 text-center" style={{ color: '#a0b4cc' }}>
              Base Stats
            </h2>
            <div className="grid grid-cols-2 gap-x-5 gap-y-3">
              {statKeys.map(key => {
                const value = pokemon.stats[key]
                const max = STAT_MAX[key]
                const pct = Math.min(100, (value / max) * 100)
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="whitespace-nowrap" style={{ color: '#a0b4cc' }}>{STAT_LABELS[key]}:</span>
                      <span className="font-mono font-medium" style={{ color: '#e0e8f0' }}>{value}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden" style={{ backgroundColor: '#111827' }}>
                      <div className="h-full" style={{ width: `${pct}%`, backgroundColor: statColor(value) }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-3" style={{ borderTop: '1px solid #2d3d60' }}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold" style={{ color: '#a0b4cc' }}>Total:</span>
                <span className="font-mono font-semibold" style={{ color: bstColor(pokemon.stats.total) }}>{pokemon.stats.total}</span>
              </div>
              <div className="h-2.5 overflow-hidden" style={{ backgroundColor: '#111827' }}>
                <div className="h-full"
                  style={{ width: `${Math.min(100, (pokemon.stats.total / BST_MAX) * 100)}%`, backgroundColor: bstColor(pokemon.stats.total) }} />
              </div>
            </div>
          </div>
          </div>{/* end compare+stats grid */}

        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">

          {/* Abilities card */}
          <div className="rounded-xl p-5" style={{ backgroundColor: '#1e2a42', border: '1px solid #2d3d60' }}>
            <h2 className="text-sm font-semibold mb-1 text-center truncate" title={`${pokemon.displayName}'s Abilities`} style={{ color: '#a0b4cc' }}>
              {pokemon.displayName}&apos;s Abilities
            </h2>
            <p className="text-xs text-center mb-4" style={{ color: '#7a8caa' }}>
              Here are what abilities {pokemon.displayName} can possibly have, along with their effects.
            </p>
            <div className="space-y-3">
              {pokemon.abilities.map(ability => (
                <div key={ability.name} className="rounded-lg overflow-hidden" style={{ border: '1px solid #3d5080' }}>
                  <div className="py-2 px-4 flex items-center" style={{ backgroundColor: '#162032' }}>
                    <div className="flex-1" />
                    <span className="font-bold text-sm" style={{ color: '#e0e8f0' }}>{ability.displayName}</span>
                    <div className="flex-1 flex justify-end">
                      {ability.isHidden && (
                        <span className="text-xs font-bold tracking-wide" style={{ color: '#7a8caa' }}>HIDDEN</span>
                      )}
                    </div>
                  </div>
                  {ability.description && (
                    <div className="py-3 px-4" style={{ backgroundColor: '#243450' }}>
                      <p className="text-xs leading-relaxed" style={{ color: '#c0d0e0' }}>{ability.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses & Resistances card */}
          <div className="rounded-xl p-5" style={{ backgroundColor: '#1e2a42', border: '1px solid #2d3d60' }}>
            <h2 className="text-sm font-semibold mb-1 text-center" style={{ color: '#a0b4cc' }}>
              Weaknesses &amp; Resistances
            </h2>
            <p className="text-xs text-center mb-4" style={{ color: '#7a8caa' }}>
              Below is a list of what {pokemon.displayName}&apos;s weakness and resistance is to various types.
            </p>
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #2d3d60' }}>
              <table className="w-full text-sm">
                <tbody>
                  {rows.map(row => (
                    <tr key={row.mult}>
                      <td
                        className="py-1.5 px-4 font-bold text-center w-14 text-base"
                        style={{ backgroundColor: row.labelBg, color: '#e0e8f0' }}
                      >
                        {row.label}
                      </td>
                      <td className="py-1.5 px-4" style={{ backgroundColor: row.rowBg }}>
                        <div className="flex flex-wrap gap-2">
                          {row.types.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
