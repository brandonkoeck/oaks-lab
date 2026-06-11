export const TYPES = [
  'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy',
] as const

export type PokemonType = typeof TYPES[number]

export const TYPE_COLORS: Record<PokemonType, string> = {
  Normal:   '#A8A878',
  Fire:     '#F08030',
  Water:    '#6890F0',
  Grass:    '#78C850',
  Electric: '#F8D030',
  Ice:      '#98D8D8',
  Fighting: '#C03028',
  Poison:   '#A040A0',
  Ground:   '#E0C068',
  Flying:   '#A890F0',
  Psychic:  '#F85888',
  Bug:      '#A8B820',
  Rock:     '#B8A038',
  Ghost:    '#705898',
  Dragon:   '#7038F8',
  Dark:     '#705848',
  Steel:    '#B8B8D0',
  Fairy:    '#EE99AC',
}

// Rows = attacking type, values = multiplier when hitting that defending type.
// Only non-1× entries are listed; everything else is 1×.
const CHART: Partial<Record<PokemonType, Partial<Record<PokemonType, number>>>> = {
  Normal:   { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire:     { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water:    { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Grass:    { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Electric: { Water: 2, Grass: 0.5, Electric: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Ice:      { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison:   { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground:   { Fire: 2, Grass: 0.5, Electric: 2, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying:   { Grass: 2, Electric: 0.5, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic:  { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug:      { Fire: 0.5, Grass: 2, Fighting: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock:     { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost:    { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon:   { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark:     { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel:    { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy:    { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
}

export interface TypeEffectiveness {
  type: PokemonType
  multiplier: number
}

export function calculateEffectiveness(defenderTypes: string[]): TypeEffectiveness[] {
  return TYPES.map(attacker => {
    const multiplier = defenderTypes.reduce((acc, defender) => {
      const val = CHART[attacker]?.[defender as PokemonType] ?? 1
      return acc * val
    }, 1)
    return { type: attacker, multiplier }
  })
}
