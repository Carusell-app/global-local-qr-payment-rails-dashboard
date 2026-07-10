import Link from "next/link"
import { BarChart3, Bell, BriefcaseBusiness, Building2, Database, Globe2, LayoutDashboard, Network, Newspaper, Search, ShieldCheck } from "lucide-react"

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/live", label: "Live Intelligence", icon: Newspaper },
  { href: "/countries", label: "Markets", icon: Globe2 },
  { href: "/interoperability", label: "Corridors", icon: Network },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/regulation", label: "Regulation", icon: ShieldCheck },
  { href: "/opportunities", label: "Opportunities", icon: BriefcaseBusiness },
  { href: "/watchlists", label: "Watchlists", icon: Bell },
  { href: "/data-operations", label: "Data Operations", icon: Database },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_94%,transparent)] backdrop-blur">
        <div className="mx-auto flex max-w-[1480px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="focus-ring flex min-w-fit items-center gap-3 rounded-full" aria-label="Open dashboard home">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--brand-primary)] text-white">
              <BarChart3 className="h-5 w-5" />
            </span>
            <span className="hidden text-sm font-semibold tracking-tight sm:block">Rails Intel OS</span>
          </Link>

          <nav className="hidden items-center gap-1 overflow-x-auto xl:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/search" className="focus-ring ml-auto hidden min-h-11 min-w-[260px] items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-muted)] md:flex">
            <Search className="h-4 w-4" />
            <span>Search markets, rails, sources</span>
          </Link>
        </div>
        <nav className="mx-auto flex max-w-[1480px] gap-1 overflow-x-auto px-4 pb-3 sm:px-6 xl:hidden" aria-label="Primary navigation mobile">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="focus-ring inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-secondary)]">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
