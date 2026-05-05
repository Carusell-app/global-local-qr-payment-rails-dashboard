"use client"

import Script from "next/script"
import { Copy, Filter, Moon, ScanLine, Search, Sun, Users, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { QrCountryRecord, QrRegion } from "@/lib/data/qr-systems"
import { qrCountries, qrNews } from "@/lib/data/qr-systems"
import { cn } from "@/lib/utils"

const geoJsonUrl = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson"

type GlobeInstance = {
  (): (element: HTMLElement) => GlobeApi
}

type GlobeApi = {
  backgroundColor: (value: string) => GlobeApi
  globeImageUrl: (value: string) => GlobeApi
  bumpImageUrl: (value: string) => GlobeApi
  showAtmosphere: (value: boolean) => GlobeApi
  atmosphereColor: (value: string) => GlobeApi
  atmosphereAltitude: (value: number) => GlobeApi
  polygonCapColor: (fn: (feature: CountryFeature) => string) => GlobeApi
  polygonSideColor: (fn: () => string) => GlobeApi
  polygonStrokeColor: (fn: () => string) => GlobeApi
  polygonAltitude: (fn: (feature: CountryFeature) => number) => GlobeApi
  polygonsTransitionDuration: (value: number) => GlobeApi
  polygonsData: (features: CountryFeature[]) => GlobeApi
  htmlElementsData: (items: GlobeLabel[]) => GlobeApi
  htmlLat: (fn: (item: GlobeLabel) => number) => GlobeApi
  htmlLng: (fn: (item: GlobeLabel) => number) => GlobeApi
  htmlAltitude: (fn: (item: GlobeLabel) => number) => GlobeApi
  htmlElement: (fn: (item: GlobeLabel) => HTMLElement) => GlobeApi
  onPolygonHover: (fn: (feature: CountryFeature | null) => void) => GlobeApi
  onPolygonClick: (fn: (feature: CountryFeature) => void) => GlobeApi
  pointOfView: (point: { lat: number; lng: number; altitude: number }, ms?: number) => GlobeApi
  controls: () => {
    autoRotate: boolean
    autoRotateSpeed: number
    enableDamping: boolean
    dampingFactor: number
  }
  width: (value: number) => GlobeApi
  height: (value: number) => GlobeApi
}

type CountryFeature = {
  properties?: {
    ADMIN?: string
    NAME?: string
    SOVEREIGNT?: string
  }
  geometry: {
    type: "Polygon" | "MultiPolygon"
    coordinates: number[][][] | number[][][][]
  }
}

type GlobeLabel = {
  country: QrCountryRecord
  lat: number
  lng: number
  text: string
}

declare global {
  interface Window {
    Globe?: GlobeInstance
  }
}

const regions: Array<QrRegion | "All"> = ["All", "Asia", "Middle East", "Latin America", "Africa", "Europe", "CIS"]

const regionColors: Record<QrRegion, { light: string; dark: string; chip: string; text: string }> = {
  Asia: { light: "#dff4f3", dark: "#174548", chip: "#c9ecea", text: "#0b5f5a" },
  "Middle East": { light: "#fde8dc", dark: "#5b2f20", chip: "#f8d0bd", text: "#8a3c1e" },
  "Latin America": { light: "#e1f3d8", dark: "#244a23", chip: "#ccebbf", text: "#2f6b2d" },
  Africa: { light: "#fff1bf", dark: "#584315", chip: "#ffe38a", text: "#765900" },
  Europe: { light: "#e2e9ff", dark: "#223662", chip: "#cfdcff", text: "#284a9a" },
  CIS: { light: "#eee4ff", dark: "#3d2a61", chip: "#ddcaff", text: "#5b35a1" },
}

const countryVisuals: Record<string, { landmark: string; title: string }> = {
  Argentina: { landmark: "🏙️", title: "Buenos Aires payments corridor" },
  Bangladesh: { landmark: "🏦", title: "Dhaka banking network" },
  Brazil: { landmark: "🌆", title: "São Paulo merchant rails" },
  Cambodia: { landmark: "🏛️", title: "Phnom Penh QR acceptance" },
  Egypt: { landmark: "🏺", title: "Cairo acquiring network" },
  India: { landmark: "🕌", title: "Taj Mahal payment market" },
  Indonesia: { landmark: "🏙️", title: "Jakarta business district" },
  Japan: { landmark: "🗼", title: "Tokyo wallet ecosystem" },
  Kazakhstan: { landmark: "🏦", title: "Almaty transfer rails" },
  Kyrgyzstan: { landmark: "⛰️", title: "Bishkek payment network" },
  Laos: { landmark: "🏛️", title: "Vientiane QR acceptance" },
  Malaysia: { landmark: "🏙️", title: "Kuala Lumpur DuitNow market" },
  Maldives: { landmark: "🏝️", title: "Island merchant acceptance" },
  Mexico: { landmark: "🏙️", title: "Mexico City payment rails" },
  Mongolia: { landmark: "🏦", title: "Ulaanbaatar QR network" },
  Morocco: { landmark: "🕌", title: "Casablanca payment market" },
  Nepal: { landmark: "⛰️", title: "Kathmandu QR acceptance" },
  Pakistan: { landmark: "🕌", title: "Karachi bank rail market" },
  Peru: { landmark: "⛰️", title: "Lima wallet acceptance" },
  Philippines: { landmark: "🌆", title: "Manila QRPH market" },
  Russia: { landmark: "🏛️", title: "Moscow QR acquiring" },
  Singapore: { landmark: "🏙️", title: "Marina Bay PayNow network" },
  "Sri Lanka": { landmark: "🏛️", title: "Colombo LankaQR market" },
  Thailand: { landmark: "🏙️", title: "Bangkok PromptPay market" },
  Tajikistan: { landmark: "⛰️", title: "Dushanbe payment network" },
  Turkey: { landmark: "🕌", title: "Istanbul TR QR market" },
  Uzbekistan: { landmark: "🕌", title: "Tashkent QR acceptance" },
  Vietnam: { landmark: "🏙️", title: "Ho Chi Minh City VietQR market" },
  "European Union": { landmark: "🏦", title: "European account-to-account wallet" },
  Poland: { landmark: "🏙️", title: "Warsaw BLIK network" },
  Spain: { landmark: "🏛️", title: "Madrid Bizum market" },
  Italy: { landmark: "🏛️", title: "Milan Satispay acceptance" },
  Greece: { landmark: "🏛️", title: "Athens IRIS payment rail" },
}

export function WorldMap() {
  const globeEl = useRef<HTMLDivElement | null>(null)
  const globe = useRef<GlobeApi | null>(null)
  const polygons = useRef<CountryFeature[]>([])
  const labels = useRef<GlobeLabel[]>([])
  const autoRotationStopped = useRef(false)
  const [globeReady, setGlobeReady] = useState(false)
  const [hoveredFeature, setHoveredFeature] = useState<CountryFeature | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<QrCountryRecord | null>(null)
  const [query, setQuery] = useState("")
  const [region, setRegion] = useState<QrRegion | "All">("All")
  const [darkMode, setDarkMode] = useState(false)
  const [toast, setToast] = useState("")
  const [loadError, setLoadError] = useState("")
  const [tooltip, setTooltip] = useState<{ x: number; y: number; country?: QrCountryRecord; name: string } | null>(null)
  const hoveredRef = useRef<CountryFeature | null>(null)
  const selectedRef = useRef<QrCountryRecord | null>(null)
  const queryRef = useRef("")
  const darkModeRef = useRef(false)
  const visibleCountryNamesRef = useRef(new Set<string>())

  const aliasMap = useMemo(() => {
    const map = new Map<string, QrCountryRecord>()
    qrCountries.forEach((country) => country.aliases.forEach((alias) => map.set(alias.toLowerCase(), country)))
    return map
  }, [])

  const visibleCountries = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return qrCountries.filter((country) => {
      const regionMatches = region === "All" || country.region === region
      if (!regionMatches) return false
      if (!normalized) return true
      return [
        country.country,
        country.region,
        ...country.systems.map((system) => system.name),
        ...country.systems.flatMap((system) => system.pspProviders),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    })
  }, [query, region])

  const visibleCountryNames = useMemo(() => new Set(visibleCountries.map((country) => country.country)), [visibleCountries])
  const totalSystems = visibleCountries.reduce((sum, country) => sum + country.systems.length, 0)
  const totalProviders = new Set(visibleCountries.flatMap((country) => country.systems.flatMap((system) => system.pspProviders))).size

  const featureName = useCallback((feature: CountryFeature) => feature.properties?.ADMIN ?? feature.properties?.NAME ?? feature.properties?.SOVEREIGNT ?? "", [])

  const countryForFeature = useCallback(
    (feature: CountryFeature | null) => {
      if (!feature) return undefined
      return aliasMap.get(featureName(feature).toLowerCase())
    },
    [aliasMap, featureName],
  )

  const stopAutoRotate = useCallback(() => {
    if (!globe.current || autoRotationStopped.current) return
    autoRotationStopped.current = true
    globe.current.controls().autoRotate = false
  }, [])

  const polygonColor = useCallback(
    (feature: CountryFeature) => {
      const country = countryForFeature(feature)
      const selected = country && selectedRef.current?.country === country.country
      const hovered = hoveredRef.current === feature
      const hasActiveQr = country?.systems.some((system) => system.status !== "Not Launched")
      const matchedByFilter = country && visibleCountryNamesRef.current.has(country.country)
      const dark = darkModeRef.current

      if (selected) return dark ? "#24676d" : "#b8e3e7"
      if (hovered) return dark ? "#3a3a3a" : "#dddddd"
      if (country && queryRef.current && !matchedByFilter) return dark ? "rgba(48,48,48,0.38)" : "rgba(233,233,233,0.42)"
      if (hasActiveQr && country) return dark ? regionColors[country.region].dark : regionColors[country.region].light
      return dark ? politicalDarkColor(featureName(feature)) : politicalLightColor(featureName(feature))
    },
    [countryForFeature, featureName],
  )

  const polygonAltitude = useCallback(
    (feature: CountryFeature) => {
      const country = countryForFeature(feature)
      if (country && selectedRef.current?.country === country.country) return 0.018
      if (hoveredRef.current === feature) return 0.012
      if (country && queryRef.current && visibleCountryNamesRef.current.has(country.country)) return 0.01
      return 0.004
    },
    [countryForFeature],
  )

  const refreshGlobe = useCallback(() => {
    if (globe.current) {
      globe.current.polygonsData([...polygons.current])
      globe.current.htmlElementsData([...labels.current])
    }
  }, [])

  const focusCountry = useCallback(
    (country: QrCountryRecord) => {
      if (!globe.current) return
      const feature = polygons.current.find((item) => countryForFeature(item)?.country === country.country)
      if (!feature) return
      const center = approximateCenter(feature)
      globe.current.pointOfView({ ...center, altitude: 1.65 }, 750)
    },
    [countryForFeature],
  )

  const selectCountry = useCallback(
    (country: QrCountryRecord, focus = false) => {
      setSelectedCountry(country)
      stopAutoRotate()
      if (focus) focusCountry(country)
    },
    [focusCountry, stopAutoRotate],
  )

  useEffect(() => {
    hoveredRef.current = hoveredFeature
    selectedRef.current = selectedCountry
    queryRef.current = query
    darkModeRef.current = darkMode
    visibleCountryNamesRef.current = visibleCountryNames
    refreshGlobe()
  }, [darkMode, hoveredFeature, query, refreshGlobe, selectedCountry, visibleCountryNames])

  useEffect(() => {
    if (!globeReady || !window.Globe || !globeEl.current || globe.current) return

    const world = window.Globe()(globeEl.current)
      .backgroundColor("rgba(0,0,0,0)")
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-day.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .showAtmosphere(true)
      .atmosphereColor("#d9eef0")
      .atmosphereAltitude(0.12)
      .polygonCapColor((feature: CountryFeature) => polygonColor(feature))
      .polygonSideColor(() => "rgba(0,0,0,0)")
      .polygonStrokeColor(() => (darkModeRef.current ? "rgba(255,255,255,0.30)" : "rgba(90,90,90,0.32)"))
      .polygonAltitude((feature: CountryFeature) => polygonAltitude(feature))
      .polygonsTransitionDuration(180)
      .htmlElementsData([])
      .htmlLat((item: GlobeLabel) => item.lat)
      .htmlLng((item: GlobeLabel) => item.lng)
      .htmlAltitude(() => 0.035)
      .htmlElement((item: GlobeLabel) => {
        const element = document.createElement("button")
        element.type = "button"
        element.textContent = item.text
        element.title = item.country.country
        element.setAttribute("aria-label", `Open ${item.country.country}`)
        element.style.width = "28px"
        element.style.height = "28px"
        element.style.display = "grid"
        element.style.placeItems = "center"
        element.style.padding = "0"
        element.style.border = "0"
        element.style.borderRadius = "8px"
        element.style.background = "rgba(255,255,255,0.74)"
        element.style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)"
        element.style.fontSize = "18px"
        element.style.lineHeight = "1"
        element.style.cursor = "pointer"
        element.onclick = (event) => {
          event.stopPropagation()
          selectCountry(item.country, false)
        }
        return element
      })
      .onPolygonHover((feature: CountryFeature | null) => {
        setHoveredFeature(feature)
        if (!feature) setTooltip(null)
      })
      .onPolygonClick((feature: CountryFeature) => {
        const country = countryForFeature(feature)
        if (country) selectCountry(country)
      })

    globe.current = world
    world.controls().autoRotate = true
    world.controls().autoRotateSpeed = 0.38
    world.controls().enableDamping = true
    world.controls().dampingFactor = 0.08
    world.pointOfView({ lat: 18, lng: 78, altitude: 3.05 }, 0)

    const globeNode = globeEl.current
    const resize = () => {
      if (!globe.current || !globeNode) return
      globe.current.width(globeNode.clientWidth)
      globe.current.height(globeNode.clientHeight)
    }

    globeNode.addEventListener("pointerdown", stopAutoRotate)
    globeNode.addEventListener("wheel", stopAutoRotate, { passive: true })
    window.addEventListener("resize", resize)
    resize()

    fetch(geoJsonUrl)
      .then((response) => response.json())
      .then((geo: { features: CountryFeature[] }) => {
        polygons.current = geo.features
        labels.current = makeLabels(geo.features, aliasMap)
        world.polygonsData(geo.features)
        world.htmlElementsData(labels.current)
      })
      .catch((error: Error) => setLoadError(error.message))

    return () => {
      globeNode.removeEventListener("pointerdown", stopAutoRotate)
      globeNode.removeEventListener("wheel", stopAutoRotate)
      window.removeEventListener("resize", resize)
    }
  }, [aliasMap, countryForFeature, globeReady, polygonAltitude, polygonColor, selectCountry, stopAutoRotate])

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!hoveredFeature) return
    const name = featureName(hoveredFeature)
    setTooltip({
      x: Math.min(window.innerWidth - 250, event.clientX + 14),
      y: Math.min(window.innerHeight - 130, event.clientY + 14),
      country: countryForFeature(hoveredFeature),
      name,
    })
  }

  function copySystemName(systemName: string) {
    navigator.clipboard?.writeText(systemName)
    setToast("System name copied")
    window.setTimeout(() => setToast(""), 1400)
  }

  return (
    <section id="world-map" className={cn("overflow-hidden rounded-lg bg-white text-[#111] shadow-[0_1px_4px_rgba(0,0,0,0.07)]", darkMode && "bg-[#111] text-[#f4f4f4]")}>
      <Script src="https://unpkg.com/globe.gl" strategy="afterInteractive" onLoad={() => setGlobeReady(true)} />

      <div className={cn("flex flex-wrap items-center gap-3 bg-white px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.07)]", darkMode && "bg-[#111]")}>
        <div className={cn("grid h-10 w-10 place-items-center rounded-lg bg-[#f5f5f5] shadow-[0_1px_4px_rgba(0,0,0,0.07)]", darkMode && "bg-[#1d1d1d]")}>
          <ScanLine className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold tracking-tight">QR Payment Systems</h2>
          <p className={cn("text-xs text-[#666]", darkMode && "text-[#b8b8b8]")}>Globe.gl Natural Earth country polygons</p>
        </div>
        <div className="ml-auto flex flex-1 flex-wrap justify-end gap-3">
          <label className={cn("flex h-10 min-w-[180px] items-center gap-2 rounded-lg bg-[#f5f5f5] px-3 text-sm text-[#666] shadow-[0_1px_4px_rgba(0,0,0,0.07)]", darkMode && "bg-[#1d1d1d] text-[#b8b8b8]")}>
            <Filter className="h-4 w-4" />
            <select className={cn("w-full bg-transparent text-[#111] outline-none", darkMode && "text-[#f4f4f4]")} value={region} onChange={(event) => setRegion(event.target.value as QrRegion | "All")}>
              {regions.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All regions" : item}
                </option>
              ))}
            </select>
          </label>
          <label className={cn("flex h-10 min-w-[260px] items-center gap-2 rounded-lg bg-[#f5f5f5] px-3 text-sm text-[#666] shadow-[0_1px_4px_rgba(0,0,0,0.07)]", darkMode && "bg-[#1d1d1d] text-[#b8b8b8]")}>
            <Search className="h-4 w-4" />
            <input className={cn("w-full bg-transparent text-[#111] outline-none placeholder:text-[#999]", darkMode && "text-[#f4f4f4]")} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search country, system, PSP" />
          </label>
          <button className={cn("grid h-10 w-10 place-items-center rounded-lg bg-[#f5f5f5] shadow-[0_1px_4px_rgba(0,0,0,0.07)]", darkMode && "bg-[#1d1d1d]")} type="button" onClick={() => setDarkMode((value) => !value)} aria-label="Toggle dark mode">
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="grid h-[clamp(430px,56vh,560px)] grid-cols-[330px_1fr] gap-3 bg-white p-3 max-lg:h-auto max-lg:grid-cols-1 max-lg:[&_.qr-list-panel]:max-h-[250px] max-lg:[&_.qr-globe]:h-[430px]">
        <aside className={cn("qr-list-panel flex min-h-0 flex-col overflow-hidden rounded-lg bg-[#f5f5f5] shadow-[0_1px_4px_rgba(0,0,0,0.07)]", darkMode && "bg-[#1d1d1d]")}>
          <div className="p-4">
            <h3 className="text-sm font-extrabold">Country systems</h3>
            <p className={cn("mt-1 text-xs leading-5 text-[#666]", darkMode && "text-[#b8b8b8]")}>
              {visibleCountries.length} markets in view. Every country is represented by its national flag emoji.
            </p>
          </div>
          <div className="min-h-0 overflow-auto px-2 pb-3">
            {visibleCountries.map((country) => (
              <button
                key={country.country}
                type="button"
                onClick={() => selectCountry(country, true)}
                className={cn(
                  "grid w-full grid-cols-[34px_1fr_auto] items-start gap-2 rounded-lg bg-transparent p-3 text-left transition hover:bg-white",
                  selectedCountry?.country === country.country && "bg-white",
                  darkMode && "hover:bg-[#171717]",
                  darkMode && selectedCountry?.country === country.country && "bg-[#171717]",
                )}
              >
                <span className="text-2xl leading-none">{country.flag}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{country.country}</span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {country.systems.map((system) => (
                      <span
                        key={system.name}
                        className="rounded-lg px-2 py-1 text-[11px]"
                        style={{
                          backgroundColor: darkMode ? regionColors[country.region].dark : regionColors[country.region].chip,
                          color: darkMode ? "#f4f4f4" : regionColors[country.region].text,
                        }}
                      >
                        {system.name}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="text-xs text-[#999]">{country.systems.length}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className={cn("relative overflow-hidden rounded-lg bg-[#f5f5f5] shadow-[0_1px_4px_rgba(0,0,0,0.07)]", darkMode && "bg-[#1d1d1d]")}>
          <div
            ref={globeEl}
            className="qr-globe h-full w-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTooltip(null)}
          />
          <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
            <Stat label="Countries" value={visibleCountries.length} darkMode={darkMode} />
            <Stat label="QR systems" value={totalSystems} darkMode={darkMode} />
            <Stat label="PSPs" value={totalProviders} darkMode={darkMode} />
          </div>
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
            {regions.filter((item) => item !== "All").map((item) => (
              <span
                key={item}
                className="rounded-lg px-2.5 py-1 text-xs font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.07)]"
                style={{
                  backgroundColor: darkMode ? regionColors[item].dark : regionColors[item].chip,
                  color: darkMode ? "#f4f4f4" : regionColors[item].text,
                }}
              >
                {item}
              </span>
            ))}
          </div>
          {loadError && (
            <div className={cn("absolute inset-x-4 bottom-4 rounded-lg bg-white p-4 text-sm text-[#666] shadow-[0_1px_4px_rgba(0,0,0,0.07)]", darkMode && "bg-[#171717] text-[#b8b8b8]")}>
              Globe data failed to load. Check network access to Globe.gl and Natural Earth GeoJSON. {loadError}
            </div>
          )}
        </div>
      </div>

      <div className={cn("bg-[#f5f5f5] p-3", darkMode && "bg-[#1d1d1d]")}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-extrabold">News / Updates</h3>
          <span className={cn("rounded-lg bg-[#e8e8e8] px-2 py-1 text-xs text-[#666]", darkMode && "bg-[#2b2b2b] text-[#b8b8b8]")}>Provider updates</span>
        </div>
        <div className="grid auto-cols-[minmax(260px,340px)] grid-flow-col gap-3 overflow-x-auto pb-1">
          {qrNews.map((item) => {
            const country = qrCountries.find((record) => record.country === item.country)
            return (
              <article key={`${item.country}-${item.system}-${item.date}`} className={cn("rounded-lg bg-white p-3 shadow-[0_1px_4px_rgba(0,0,0,0.07)]", darkMode && "bg-[#171717]")}>
                <div
                  className="mb-2 inline-flex rounded-lg px-2 py-1 text-xs font-extrabold"
                  style={{
                    backgroundColor: country ? (darkMode ? regionColors[country.region].dark : regionColors[country.region].chip) : "#e8e8e8",
                    color: country ? (darkMode ? "#f4f4f4" : regionColors[country.region].text) : "#666",
                  }}
                >
                  {country?.flag} {item.country} - {country?.flag} {item.system}
                </div>
                <h4 className="mt-2 text-sm font-extrabold leading-5">{item.headline}</h4>
                <p className={cn("mt-1 text-xs leading-5 text-[#666]", darkMode && "text-[#b8b8b8]")}>{item.description}</p>
                <span className="mt-2 block text-xs text-[#999]">{item.date}</span>
              </article>
            )
          })}
        </div>
      </div>

      {tooltip && (
        <div className={cn("pointer-events-none fixed z-50 w-[230px] rounded-lg bg-white p-3 shadow-[0_1px_4px_rgba(0,0,0,0.07)]", darkMode && "bg-[#171717]")} style={{ left: tooltip.x, top: tooltip.y }}>
          <strong className="block text-sm">{tooltip.country ? `${tooltip.country.flag} ${tooltip.country.country}` : tooltip.name}</strong>
          <span className={cn("mt-1 block text-xs leading-5 text-[#666]", darkMode && "text-[#b8b8b8]")}>
            {tooltip.country ? `${tooltip.country.systems.length} QR system${tooltip.country.systems.length > 1 ? "s" : ""}` : "No QR system in dataset"}
          </span>
          {tooltip.country && <span className={cn("block text-xs leading-5 text-[#666]", darkMode && "text-[#b8b8b8]")}>{tooltip.country.systems.map((system) => system.name).join(", ")}</span>}
        </div>
      )}

      <aside className={cn("fixed right-0 top-0 z-40 h-screen w-[min(460px,94vw)] translate-x-full overflow-y-auto rounded-lg bg-white p-5 shadow-[-10px_0_28px_rgba(0,0,0,0.12)] transition-transform duration-200 ease-out", selectedCountry && "translate-x-0", darkMode && "bg-[#171717]")}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-3xl font-extrabold tracking-tight">{selectedCountry ? `${selectedCountry.flag} ${selectedCountry.country}` : "Country"}</h3>
            {selectedCountry && <p className={cn("mt-2 text-sm text-[#666]", darkMode && "text-[#b8b8b8]")}>{selectedCountry.region} · {selectedCountry.systems.length} system{selectedCountry.systems.length > 1 ? "s" : ""}</p>}
          </div>
          <button className={cn("grid h-10 w-10 place-items-center rounded-lg bg-[#f5f5f5] shadow-[0_1px_4px_rgba(0,0,0,0.07)]", darkMode && "bg-[#1d1d1d]")} type="button" onClick={() => setSelectedCountry(null)} aria-label="Close country detail drawer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5">
          {selectedCountry && (
            <div
              className="mb-4 rounded-lg p-4 shadow-[0_1px_4px_rgba(0,0,0,0.07)]"
              style={{
                backgroundColor: darkMode ? regionColors[selectedCountry.region].dark : regionColors[selectedCountry.region].light,
                color: darkMode ? "#f4f4f4" : "#111111",
              }}
            >
              <div className="flex items-center gap-4">
                <div className="grid h-20 w-20 place-items-center rounded-lg bg-white text-4xl shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
                  {countryVisuals[selectedCountry.country]?.landmark ?? selectedCountry.flag}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: darkMode ? "#e8e8e8" : "#555" }}>
                    {selectedCountry.flag} {countryVisuals[selectedCountry.country]?.title ?? selectedCountry.country}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold tracking-tight">{selectedCountry.flag} {selectedCountry.country}</p>
                  <p className="mt-1 text-sm" style={{ color: darkMode ? "#e8e8e8" : "#555" }}>
                    {selectedCountry.flag} {selectedCountry.region} payment systems
                  </p>
                </div>
              </div>
            </div>
          )}
          {selectedCountry?.systems.map((system) => (
            <article key={system.name} className={cn("mb-3 rounded-lg bg-[#f5f5f5] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.07)]", darkMode && "bg-[#1d1d1d]")}>
              <h4 className="text-lg font-extrabold tracking-tight">{selectedCountry.flag} {system.name}</h4>
              <div className="mt-3">{statusBadge(system.status)}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {system.pspProviders.map((psp) => (
                  <span
                    key={psp}
                    className="rounded-lg px-2 py-1 text-xs"
                    style={{
                      backgroundColor: darkMode ? regionColors[selectedCountry.region].dark : regionColors[selectedCountry.region].chip,
                      color: darkMode ? "#f4f4f4" : regionColors[selectedCountry.region].text,
                    }}
                  >
                    {psp}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => copySystemName(system.name)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#111] px-3 text-xs font-bold text-white shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
                  <Copy className="h-3.5 w-3.5" /> Copy system name
                </button>
                <button type="button" onClick={() => setToast(`${system.pspProviders.length} PSP providers listed`)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-xs font-bold text-[#111] shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
                  <Users className="h-3.5 w-3.5" /> View PSPs
                </button>
              </div>
            </article>
          ))}
          {selectedCountry?.country === "Kazakhstan" && (
            <p className={cn("rounded-lg bg-[#f5f5f5] p-4 text-sm leading-6 text-[#666] shadow-[0_1px_4px_rgba(0,0,0,0.07)]", darkMode && "bg-[#1d1d1d] text-[#b8b8b8]")}>
              🇰🇿 Kazakhstan is included with its national flag emoji, but the base dataset marks no national QR system: transfers only.
            </p>
          )}
        </div>
      </aside>

      {toast && <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#111] px-3 py-2 text-xs font-bold text-white shadow-[0_1px_4px_rgba(0,0,0,0.07)]">{toast}</div>}
    </section>
  )
}

function Stat({ label, value, darkMode }: { label: string; value: number; darkMode: boolean }) {
  return (
    <div className={cn("rounded-lg bg-white px-3 py-2 shadow-[0_1px_4px_rgba(0,0,0,0.07)]", darkMode && "bg-[#171717]")}>
      <span className="block text-[10px] font-bold text-[#999]">{label}</span>
      <span className="mt-1 block text-xl font-extrabold tracking-tight">{value}</span>
    </div>
  )
}

function statusBadge(status: QrCountryRecord["systems"][number]["status"]) {
  if (status === "Active") return <span className="inline-flex rounded-lg bg-[#e6f9ec] px-2 py-1 text-xs font-bold text-[#22a34a]">🟢 Active</span>
  if (status === "Negotiations") return <span className="inline-flex rounded-lg bg-[#fffbe6] px-2 py-1 text-xs font-bold text-[#b08800]">🟡 Negotiations</span>
  return <span className="inline-flex rounded-lg bg-[#fdecea] px-2 py-1 text-xs font-bold text-[#d32f2f]">🔴 Not Launched</span>
}

function approximateCenter(feature: CountryFeature) {
  const points: number[][] = []
  const collectRing = (ring: number[][]) => ring.forEach((point) => points.push(point))

  if (feature.geometry.type === "Polygon") {
    ;(feature.geometry.coordinates as number[][][]).forEach(collectRing)
  } else {
    ;(feature.geometry.coordinates as number[][][][]).forEach((polygon) => polygon.forEach(collectRing))
  }

  if (!points.length) return { lat: 20, lng: 0 }
  const sum = points.reduce((acc, point) => ({ lng: acc.lng + point[0], lat: acc.lat + point[1] }), { lat: 0, lng: 0 })
  return { lat: sum.lat / points.length, lng: sum.lng / points.length }
}

function makeLabels(features: CountryFeature[], aliasMap: Map<string, QrCountryRecord>) {
  const labelsByCountry = new Map<string, GlobeLabel>()

  features.forEach((feature) => {
    const name = feature.properties?.ADMIN ?? feature.properties?.NAME ?? feature.properties?.SOVEREIGNT ?? ""
    const country = aliasMap.get(name.toLowerCase())
    if (!country) return
    const center = country.labelCoordinates ?? approximateCenter(feature)
    labelsByCountry.set(country.country, {
      country,
      lat: center.lat,
      lng: center.lng,
      text: country.flag,
    })
  })

  qrCountries.forEach((country) => {
    if (!country.labelCoordinates || labelsByCountry.has(country.country)) return
    labelsByCountry.set(country.country, {
      country,
      lat: country.labelCoordinates.lat,
      lng: country.labelCoordinates.lng,
      text: country.flag,
    })
  })

  return Array.from(labelsByCountry.values())
}

function politicalLightColor(name: string) {
  const palette = ["#eeeeee", "#e7e7e7", "#dedede", "#f1f1f1", "#e2e2e2"]
  return palette[hashString(name) % palette.length]
}

function politicalDarkColor(name: string) {
  const palette = ["#303030", "#383838", "#2a2a2a", "#343434", "#262626"]
  return palette[hashString(name) % palette.length]
}

function hashString(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}
