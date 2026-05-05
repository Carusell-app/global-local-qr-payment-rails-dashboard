import type { Metadata, Viewport } from "next"
import { AppShell } from "@/components/layout/app-shell"
import "./globals.css"

export const metadata: Metadata = {
  title: "Global Local QR & Payment Rails Intelligence",
  description: "Research dashboard for national QR systems, instant payment rails, interoperability, PSP access and crypto regulation.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafafa",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
