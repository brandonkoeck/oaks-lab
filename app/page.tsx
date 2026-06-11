import { getAllPokemon } from '@/lib/pokemonApi'
import PokemonList from './components/PokemonList'

export default async function Home() {
  const pokemon = await getAllPokemon()

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#e0e8f0' }}>
          Pokédex
        </h1>
        <p className="text-sm" style={{ color: '#7a8caa' }}>
          All generations · {pokemon.length.toLocaleString()} Pokémon
        </p>
      </div>
      <PokemonList pokemon={pokemon} />
    </main>
  )
}
