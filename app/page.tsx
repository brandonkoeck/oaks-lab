import TypeChecker from './components/TypeChecker'

export default function Home() {
  return (
    <main className="flex flex-col items-center px-6 py-12 min-h-screen">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-1">
          Pokémon Type Checker
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-10 text-sm">
          Covers all 18 types including Generation 9 — select one or two types to see weaknesses, resistances, and immunities.
        </p>
        <TypeChecker />
      </div>
    </main>
  )
}
