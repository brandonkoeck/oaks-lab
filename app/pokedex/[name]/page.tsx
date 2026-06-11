import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getAllPokemon, getPokemon } from '@/lib/pokemonApi'
import { calculateEffectiveness, TYPE_COLORS, PokemonType } from '@/lib/typeData'

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
    description: `Type weaknesses and resistances for ${pokemon.displayName} (${pokemon.types.join('/')}).`,
  }
}

const WEAKNESS_ROWS = [
  { mult: 4,    label: '4×',  rowBg: '#4a1010', labelBg: '#6b1a1a' },
  { mult: 2,    label: '2×',  rowBg: '#3a1a0a', labelBg: '#5a2a10' },
  { mult: 0.5,  label: '½×',  rowBg: '#0a2818', labelBg: '#0f3820' },
  { mult: 0.25, label: '¼×',  rowBg: '#071e12', labelBg: '#0c2e1a' },
  { mult: 0,    label: '0×',  rowBg: '#141422', labelBg: '#1e1e36' },
]

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type as PokemonType] ?? '#777'
  return (
    <span
      style={{ backgroundColor: color, textShadow: '0 1px 1px rgba(0,0,0,0.5)' }}
      className="px-3 py-1 rounded text-white text-sm font-bold uppercase tracking-wide"
    >
      {type}
    </span>
  )
}

export default async function PokemonPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const pokemon = await getPokemon(name)
  if (!pokemon) notFound()

  const effectiveness = calculateEffectiveness(pokemon.types)

  const rows = WEAKNESS_ROWS.map(row => ({
    ...row,
    types: effectiveness
      .filter(e => e.multiplier === row.mult)
      .map(e => e.type),
  })).filter(row => row.types.length > 0)

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="text-sm hover:underline mb-6 inline-block"
        style={{ color: '#6eb5ff' }}
      >
        ← Back to Pokédex
      </Link>

      <div className="rounded-xl p-6" style={{ backgroundColor: '#1e2a42', border: '1px solid #2d3d60' }}>
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          {pokemon.sprite ? (
            <Image
              src={pokemon.sprite}
              alt={pokemon.displayName}
              width={96}
              height={96}
              unoptimized
              className="pixelated"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg" style={{ backgroundColor: '#2a3a5a' }} />
          )}
          <div>
            <p className="text-sm font-mono mb-1" style={{ color: '#7a8caa' }}>
              #{pokemon.speciesId}
            </p>
            <h1 className="text-3xl font-bold mb-3" style={{ color: '#e0e8f0' }}>
              {pokemon.displayName}
            </h1>
            <div className="flex gap-2 flex-wrap">
              {pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
            </div>
          </div>
        </div>

        {/* Weaknesses & Resistances */}
        <h2 className="text-base font-semibold mb-3" style={{ color: '#a0b4cc' }}>
          Weaknesses &amp; Resistances
        </h2>
        <p className="text-xs mb-4" style={{ color: '#7a8caa' }}>
          Damage multipliers when attacking {pokemon.displayName} with each type.
        </p>

        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #2d3d60' }}>
          <table className="w-full text-sm">
            <tbody>
              {rows.map(row => (
                <tr key={row.mult}>
                  <td
                    className="py-3 px-4 font-bold text-center w-14 text-base"
                    style={{ backgroundColor: row.labelBg, color: '#e0e8f0' }}
                  >
                    {row.label}
                  </td>
                  <td className="py-3 px-4" style={{ backgroundColor: row.rowBg }}>
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
    </main>
  )
}
