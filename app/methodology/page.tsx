import { SeedBadge, StatusBadge } from "@/components/ui/status-badge"

const sections = [
  {
    title: "QR system classification",
    body: "Systems are classified as national_qr, instant_payment, wallet_network, national_switch, card_scheme, bank_transfer or other. Classifications should be verified against official system rules.",
  },
  {
    title: "CPM / MPM",
    body: "CPM means customer-presented mode, where a consumer app presents a code. MPM means merchant-presented mode, where the merchant displays a static or dynamic QR. Some countries support both, but this seed dataset avoids asserting exact mode coverage unless confidence is marked higher.",
  },
  {
    title: "Confidence",
    body: "Confidence indicates source reliability and completeness: high for official verified data, medium for mixed official/media support, low for records that still need analyst verification.",
  },
  {
    title: "PSP opportunity score",
    body: "The score combines market attractiveness, access difficulty, regulatory complexity, cross-border potential, merchant readiness, consumer adoption signal and crypto compatibility. It is not a financial forecast.",
  },
  {
    title: "Crypto regulation status",
    body: "Crypto status separates legal status, payment permission, exchange permission, stablecoin status, CBDC status and regulator notes. Payment acceptance is treated conservatively when unclear.",
  },
  {
    title: "Source reliability",
    body: "Official system, central bank, regulator and government sources should rank higher than media, blogs or company announcements.",
  },
]

export default function MethodologyPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6">
        <SeedBadge />
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">Methodology</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
          How this intelligence dashboard classifies payment rails, QR modes, crypto regulation, source reliability and PSP opportunity. Data requires verification before operational use.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <article key={section.title} className="rounded-3xl border border-zinc-200 bg-white p-5">
            <h2 className="font-semibold tracking-tight">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">{section.body}</p>
          </article>
        ))}
      </section>
      <section className="rounded-3xl border border-zinc-200 bg-white p-5">
        <h2 className="font-semibold tracking-tight">Status color logic</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusBadge value="live" />
          <StatusBadge value="pilot" />
          <StatusBadge value="announced" />
          <StatusBadge value="restricted" />
          <StatusBadge value="unclear" />
          <StatusBadge value="high confidence" />
        </div>
      </section>
    </div>
  )
}
