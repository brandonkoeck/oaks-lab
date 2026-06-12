export const STAT_MAX = {
  hp:             255,
  attack:         190,
  defense:        230,
  specialAttack:  194,
  specialDefense: 230,
  speed:          200,
} as const

export const BST_MAX = 780

export function bstColor(value: number): string {
  if (value < 300) return '#ef4444' // red   — unevolved/very weak
  if (value < 400) return '#f97316' // orange — below average
  if (value < 500) return '#eab308' // yellow — average
  if (value < 600) return '#22c55e' // green  — strong fully-evolved
  return '#3b82f6'                  // blue   — pseudo-legendary and above
}

export function statColor(value: number): string {
  if (value < 50)  return '#ef4444' // red
  if (value < 90)  return '#f97316' // orange
  if (value < 120) return '#eab308' // yellow
  if (value < 150) return '#22c55e' // green
  return '#3b82f6'                  // blue
}

export const STAT_LABELS = {
  hp:             'HP',
  attack:         'Attack',
  defense:        'Defense',
  specialAttack:  'Sp. Atk',
  specialDefense: 'Sp. Def',
  speed:          'Speed',
} as const
