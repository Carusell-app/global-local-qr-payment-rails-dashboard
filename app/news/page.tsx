import { newsItems } from "@/lib/data/news"
import { GlobalNews } from "@/components/news/global-news"
import { SeedBadge } from "@/components/ui/status-badge"

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6">
        <SeedBadge />
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">Global News & Source Updates</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
          Latest payment rail updates across QR interoperability, merchant rollout, crypto regulation, CBDC activity and PSP access.
        </p>
      </section>
      <GlobalNews news={newsItems} />
    </div>
  )
}
