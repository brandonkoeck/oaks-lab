import { unstable_cache } from 'next/cache'

export interface PokemonAbility {
  name: string
  displayName: string
  isHidden: boolean
  description: string
}

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
  officialArtwork: string | null
  stats: PokemonStats
  abilities: PokemonAbility[]
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
  // Galarian Mr. Mime needs the period
  'mr-mime-galar': 'Galarian Mr. Mime',
  // Tauros Paldean breeds — region in middle, not last part
  'tauros-paldea-combat': 'Combat Breed Paldean Tauros',
  'tauros-paldea-blaze':  'Blaze Breed Paldean Tauros',
  'tauros-paldea-aqua':   'Aqua Breed Paldean Tauros',
  // Darmanitan Zen Modes
  'darmanitan-zen':       'Zen Mode Darmanitan',
  'darmanitan-galar-zen': 'Zen Mode Galarian Darmanitan',
  // Kyurem fusions — descriptor precedes name officially
  'kyurem-black': 'Black Kyurem',
  'kyurem-white': 'White Kyurem',
  // Necrozma fusions
  'necrozma-dusk-mane':   'Dusk Mane Necrozma',
  'necrozma-dawn-wings':  'Dawn Wings Necrozma',
  // Calyrex riders
  'calyrex-ice-rider':    'Ice Rider Calyrex',
  'calyrex-shadow-rider': 'Shadow Rider Calyrex',
}

function formatName(name: string): string {
  if (SPECIAL_NAMES[name]) return SPECIAL_NAMES[name]

  const parts = name.split('-')
  const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1)

  const regionAdjective: Record<string, string> = {
    alola: 'Alolan',
    galar: 'Galarian',
    paldea: 'Paldean',
    hisui: 'Hisuian',
  }

  // Mega: {name}-mega or {name}-mega-x/y
  const megaIdx = parts.indexOf('mega')
  if (megaIdx !== -1) {
    const baseName = parts.slice(0, megaIdx).map(cap).join(' ')
    const suffix = parts.slice(megaIdx + 1).map(w => w.toUpperCase()).join(' ')
    return suffix ? `Mega ${baseName} ${suffix}` : `Mega ${baseName}`
  }

  // Primal: {name}-primal
  if (parts[parts.length - 1] === 'primal') {
    return `Primal ${parts.slice(0, -1).map(cap).join(' ')}`
  }

  // Regional variant: {name}-{region}
  const adjective = regionAdjective[parts[parts.length - 1]]
  if (adjective) {
    return `${adjective} ${parts.slice(0, -1).map(cap).join(' ')}`
  }

  return parts.map(cap).join(' ')
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
async function parsePokemon(p: any): Promise<Pokemon> {
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

  const rawAbilities = (p.abilities ?? []) as {
    ability: { name: string; url: string }
    is_hidden: boolean
    slot: number
  }[]

  const abilities = await Promise.all(
    rawAbilities
      .sort((a, b) => a.slot - b.slot)
      .map(async (a) => {
        try {
          const data = await fetchJSON(a.ability.url) as {
            effect_entries: { short_effect: string; language: { name: string } }[]
          }
          const entry = data.effect_entries?.find(e => e.language.name === 'en')
          return {
            name: a.ability.name,
            displayName: formatName(a.ability.name),
            isHidden: a.is_hidden,
            description: entry?.short_effect ?? '',
          }
        } catch {
          return {
            name: a.ability.name,
            displayName: formatName(a.ability.name),
            isHidden: a.is_hidden,
            description: '',
          }
        }
      })
  )

  return {
    id: p.id,
    speciesId,
    name: p.name,
    displayName: formatName(p.name),
    types: p.types.map((t: { type: { name: string } }) => capitalize(t.type.name)),
    sprite: p.sprites?.front_default ?? null,
    officialArtwork: p.sprites?.other?.['official-artwork']?.front_default ?? null,
    stats: { hp, attack, defense, specialAttack, specialDefense, speed,
             total: hp + attack + defense + specialAttack + specialDefense + speed },
    abilities,
  }
}

const COSMETIC_FORMS = new Set([
  // Minior color duplicates — red-meteor and red (core) kept as representatives
  'minior-orange-meteor', 'minior-yellow-meteor', 'minior-green-meteor',
  'minior-blue-meteor',   'minior-indigo-meteor', 'minior-violet-meteor',
  'minior-orange', 'minior-yellow', 'minior-green',
  'minior-blue',   'minior-indigo', 'minior-violet',
  // Cramorant battle-only forms
  'cramorant-gulping', 'cramorant-gorging',
  // Morpeko Hangry (battle-only type swap)
  'morpeko-hangry',
  // Mimikyu Busted (battle-only transformation)
  'mimikyu-busted',
])

function isCosmeticForm(name: string): boolean {
  if (COSMETIC_FORMS.has(name)) return true
  if (name.startsWith('pikachu-')) return true  // all cap & costume forms
  if (name.includes('-totem')) return true       // all totem forms
  return false
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
      const parsed = await Promise.all(
        results.filter(Boolean).map(p => parsePokemon(p))
      )
      pokemon.push(...parsed)
    }

    return pokemon
      .filter(p => !p.name.endsWith('-gmax') && !isCosmeticForm(p.name))
      .sort((a, b) => a.speciesId - b.speciesId || a.id - b.id)
  },
  ['all-pokemon-v7'],
  { revalidate: false }
)

export async function getPokemon(name: string): Promise<Pokemon | null> {
  const all = await getAllPokemon()
  return all.find(p => p.name === name) ?? null
}
