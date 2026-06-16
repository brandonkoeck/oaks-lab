import Link from 'next/link'

export default function Header() {
  return (
    <header style={{ backgroundColor: '#0d1424', borderBottom: '1px solid #2d3d60' }}>
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
          style={{ color: '#e0e8f0' }}
        >
          Oak&apos;s Lab
        </Link>
      </div>
    </header>
  )
}
