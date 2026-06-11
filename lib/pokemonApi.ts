import { unstable_cache } from 'next/cache'

export interface PokemonStats {
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
  speed: number
  total: number
}

export interface Pokemon {
  id: number
  speciesId: number
  name: string
  displayName: string
  types: string[]
  sprite: string | null
  stats: PokemonStats
}

const SPECIAL_NAMES: Record<string, string> = {
  'mr-mime': 'Mr. Mime',
  'mr-rime': 'Mr. Rime',
  'mime-jr': 'Mime Jr.',
  'type-null': 'Type: Null',
  'ho-oh': 'Ho-Oh',
  'porygon-z': 'Porygon-Z',
  'jangmo-o': 'Jangmo-o',
  'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o',
  'tapu-koko': 'Tapu Koko',
  'tapu-lele': 'Tapu Lele',
  'tapu-bulu': 'Tapu Bulu',
  'tapu-fini': 'Tapu Fini',
  'chi-yu': 'Chi-Yu',
  'chien-pao': 'Chien-Pao',
  'ting-lu': 'Ting-Lu',
  'wo-chien': 'Wo-Chien',
  'flutter-mane': 'Flutter Mane',
  'slither-wing': 'Slither Wing',
  'sandy-shocks': 'Sandy Shocks',
  'iron-treads': 'Iron Treads',
  'iron-bundle': 'Iron Bundle',
  'iron-hands': 'Iron Hands',
  'iron-jugulis': 'Iron Jugulis',
  'iron-moth': 'Iron Moth',
  'iron-thorns': 'Iron Thorns',
  'iron-valiant': 'Iron Valiant',
  'iron-leaves': 'Iron Leaves',
  'iron-boulder': 'Iron Boulder',
  'iron-crown': 'Iron Crown',
  'walking-wake': 'Walking Wake',
  'raging-bolt': 'Raging Bolt',
  'gouging-fire': 'Gouging Fire',
}

function formatName(name: string): string {
  if (SPECIAL_NAMES[name]) return SPECIAL_NAMES[name]
  return name
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

async function fetchJSON(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: 'force-cache' })
  if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`)
  return res.json()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsePokemon(p: any): Pokemon {
  const speciesId = parseInt(
    (p.species?.url as string | undefined)?.split('/').filter(Boolean).pop() ?? String(p.id),
    10
  )

  const rawStats = (p.stats ?? []) as { base_stat: number; stat: { name: string } }[]
  const getStat = (name: string) => rawStats.find(s => s.stat.name === name)?.base_stat ?? 0
  const hp             = getStat('hp')
  const attack         = getStat('attack')
  const defense        = getStat('defense')
  const specialAttack  = getStat('special-attack')
  const specialDefense = getStat('special-defense')
  const speed          = getStat('speed')

  return {
    id: p.id,
    speciesId,
    name: p.name,
    displayName: formatName(p.name),
    types: p.types.map((t: { type: { name: string } }) => capitalize(t.type.name)),
    sprite: p.sprites?.front_default ?? null,
    stats: { hp, attack, defense, specialAttack, specialDefense, speed,
             total: hp + attack + defense + specialAttack + specialDefense + speed },
  }
}

export const getAllPokemon = unstable_cache(
  async (): Promise<Pokemon[]> => {
    const list = await fetchJSON('https://pokeapi.co/api/v2/pokemon?limit=2000') as {
      results: { name: string; url: string }[]
    }

    const BATCH = 50
    const pokemon: Pokemon[] = []

    for (let i = 0; i < list.results.length; i += BATCH) {
      const batch = list.results.slice(i, i + BATCH)
      const results = await Promise.all(
        batch.map(({ url }) => fetchJSON(url).catch(() => null))
      )
      for (const p of results) {
        if (p) pokemon.push(parsePokemon(p))
      }
    }

    return pokemon.sort((a, b) => a.speciesId - b.speciesId || a.id - b.id)
  },
  ['all-pokemon-v2'],
  { revalidate: false }
)

export async function getPokemon(name: string): Promise<Pokemon | null> {
  const all = await getAllPokemon()
  return all.find(p => p.name === name) ?? null
}
