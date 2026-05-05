import Link from "next/link"
import { BarChart3, Globe2, Library, Map, Newspaper, Search } from "lucide-react"

const navItems = [
  { href: "/", label: "World Map", icon: Map },
  { href: "/countries", label: "Countries", icon: Globe2 },
  { href: "/interoperability", label: "Interoperability", icon: BarChart3 },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/methodology", label: "Methodology", icon: Library },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-zinc-50/94 backdrop-blur">
        <div className="mx-auto flex max-w-[1480px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="focus-ring flex min-w-fit items-center gap-3 rounded-full" aria-label="Open dashboard home">
            <span className="grid h-9 w-9 place-items-center rounded-2xl border border-zinc-200 bg-white">
              <Globe2 className="h-4 w-4" />
            </span>
            <span className="hidden text-sm font-semibold tracking-tight sm:block">Global QR Rails Intel</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-zinc-600 transition hover:bg-white hover:text-zinc-950"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden min-w-[280px] items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500 md:flex">
            <Search className="h-4 w-4" />
            <span>Search country, rail, PSP, currency</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
