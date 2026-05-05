export type QrRegion = "Asia" | "Middle East" | "Latin America" | "Africa" | "Europe" | "CIS"

export type QrSystemRecord = {
  name: string
  status: "Active" | "Negotiations" | "Not Launched"
  pspProviders: string[]
}

export type QrCountryRecord = {
  country: string
  flag: string
  region: QrRegion
  aliases: string[]
  labelCoordinates?: {
    lat: number
    lng: number
  }
  systems: QrSystemRecord[]
}

export const qrCountries: QrCountryRecord[] = [
  { country: "Argentina", flag: "🇦🇷", region: "Latin America", aliases: ["Argentina"], systems: [{ name: "AR QR", status: "Active", pspProviders: ["IM Solutions / HG Cash", "SQRIL"] }] },
  { country: "Bangladesh", flag: "🇧🇩", region: "Asia", aliases: ["Bangladesh"], systems: [{ name: "Bangla QR", status: "Active", pspProviders: ["Bank Asia PLC"] }] },
  { country: "Brazil", flag: "🇧🇷", region: "Latin America", aliases: ["Brazil"], systems: [{ name: "PIX QR", status: "Active", pspProviders: ["IM Solutions / HG Cash", "SQRIL"] }] },
  { country: "Cambodia", flag: "🇰🇭", region: "Asia", aliases: ["Cambodia"], systems: [{ name: "KHQR", status: "Active", pspProviders: ["GLN", "White Wallet"] }] },
  { country: "Egypt", flag: "🇪🇬", region: "Africa", aliases: ["Egypt"], systems: [{ name: "Meeza QR", status: "Active", pspProviders: ["Ebanx", "Paysky", "Paymob", "Banque Misr"] }, { name: "Fawry QR", status: "Active", pspProviders: ["Fawry"] }] },
  { country: "India", flag: "🇮🇳", region: "Asia", aliases: ["India"], systems: [{ name: "BharatQR", status: "Active", pspProviders: ["RazorPay"] }] },
  { country: "Indonesia", flag: "🇮🇩", region: "Asia", aliases: ["Indonesia"], systems: [{ name: "QRIS", status: "Active", pspProviders: ["Everville Estate (Mobee)", "CiCiS", "Rampable", "SQRIL", "White Wallet"] }] },
  { country: "Japan", flag: "🇯🇵", region: "Asia", aliases: ["Japan"], systems: [{ name: "PayPay QR", status: "Active", pspProviders: ["PayPay", "DJFT/PayPay", "GLN"] }] },
  { country: "Kazakhstan", flag: "🇰🇿", region: "CIS", aliases: ["Kazakhstan"], systems: [{ name: "Transfers only", status: "Not Launched", pspProviders: ["national QR system not in base"] }] },
  { country: "Kyrgyzstan", flag: "🇰🇬", region: "CIS", aliases: ["Kyrgyzstan", "Kyrgyz Republic"], systems: [{ name: "ELQR", status: "Active", pspProviders: ["mBank"] }] },
  { country: "Laos", flag: "🇱🇦", region: "Asia", aliases: ["Laos", "Lao PDR"], systems: [{ name: "Lao QR", status: "Active", pspProviders: ["ST Bank", "GLN", "White Wallet"] }] },
  { country: "Malaysia", flag: "🇲🇾", region: "Asia", aliases: ["Malaysia"], systems: [{ name: "DuitNow QR", status: "Active", pspProviders: ["Paynet", "Hitpay", "GLN", "White Wallet"] }] },
  { country: "Maldives", flag: "🇲🇻", region: "Asia", aliases: ["Maldives"], systems: [{ name: "PayMVQR", status: "Active", pspProviders: ["Dhiraagu", "Ooredoo"] }] },
  { country: "Mexico", flag: "🇲🇽", region: "Latin America", aliases: ["Mexico"], systems: [{ name: "CoDi", status: "Active", pspProviders: ["STP"] }] },
  { country: "Mongolia", flag: "🇲🇳", region: "Asia", aliases: ["Mongolia"], systems: [{ name: "QPay QR", status: "Active", pspProviders: ["GLN", "White Wallet"] }] },
  { country: "Morocco", flag: "🇲🇦", region: "Africa", aliases: ["Morocco"], systems: [{ name: "Maroc Pay", status: "Active", pspProviders: ["VPS"] }] },
  { country: "Nepal", flag: "🇳🇵", region: "Asia", aliases: ["Nepal"], systems: [{ name: "NepalPay QR", status: "Active", pspProviders: ["NIC ASIA Bank"] }] },
  { country: "Pakistan", flag: "🇵🇰", region: "Asia", aliases: ["Pakistan"], systems: [{ name: "Raast QR", status: "Active", pspProviders: ["NayaPay", "Faysal Bank", "MobilinkBank", "PayFast", "JS Bank"] }] },
  { country: "Peru", flag: "🇵🇪", region: "Latin America", aliases: ["Peru"], systems: [{ name: "Yape QR", status: "Active", pspProviders: ["SQRIL"] }] },
  { country: "Philippines", flag: "🇵🇭", region: "Asia", aliases: ["Philippines"], systems: [{ name: "QRPH", status: "Active", pspProviders: ["Coins.ph", "PayMongo", "GLN", "SQRIL", "White Wallet"] }] },
  { country: "Russia", flag: "🇷🇺", region: "CIS", aliases: ["Russia", "Russian Federation"], systems: [{ name: "QR_РФ", status: "Active", pspProviders: ["МТС Банк", "Paygine"] }] },
  { country: "Singapore", flag: "🇸🇬", region: "Asia", aliases: ["Singapore"], systems: [{ name: "PayNow", status: "Active", pspProviders: ["Hitpay"] }] },
  { country: "Sri Lanka", flag: "🇱🇰", region: "Asia", aliases: ["Sri Lanka"], systems: [{ name: "LankaQR", status: "Active", pspProviders: ["Lanka Pay"] }] },
  { country: "Thailand", flag: "🇹🇭", region: "Asia", aliases: ["Thailand"], systems: [{ name: "PromptPay", status: "Active", pspProviders: ["IPPS TH", "Coins TH", "GLN", "White Wallet"] }, { name: "Unified QR", status: "Active", pspProviders: ["Ksher"] }] },
  { country: "Tajikistan", flag: "🇹🇯", region: "CIS", aliases: ["Tajikistan"], systems: [{ name: "Express Pay", status: "Active", pspProviders: ["Dushanbe City Bank"] }] },
  { country: "Turkey", flag: "🇹🇷", region: "Europe", aliases: ["Turkey", "Türkiye"], systems: [{ name: "TR QR", status: "Active", pspProviders: ["Hayhay"] }] },
  { country: "Uzbekistan", flag: "🇺🇿", region: "CIS", aliases: ["Uzbekistan"], systems: [{ name: "UZ QR", status: "Active", pspProviders: ["Hamkor Bank", "Octo Bank"] }, { name: "Xolis Paynet", status: "Active", pspProviders: ["PayNet Xolis"] }] },
  { country: "Vietnam", flag: "🇻🇳", region: "Asia", aliases: ["Vietnam", "Viet Nam"], systems: [{ name: "VietQR", status: "Active", pspProviders: ["ArtismPay", "FinFan", "GLN", "SQRIL", "White Wallet"] }] },
  { country: "European Union", flag: "🇪🇺", region: "Europe", aliases: ["European Union"], labelCoordinates: { lat: 50.8, lng: 10.2 }, systems: [{ name: "Wero", status: "Active", pspProviders: ["European Payments Initiative (EPI)", "participating EU banks"] }] },
  { country: "Poland", flag: "🇵🇱", region: "Europe", aliases: ["Poland"], systems: [{ name: "BLIK", status: "Active", pspProviders: ["Polish Payment Standard", "participating Polish banks"] }] },
  { country: "Spain", flag: "🇪🇸", region: "Europe", aliases: ["Spain"], systems: [{ name: "Bizum", status: "Active", pspProviders: ["Bizum", "participating Spanish banks"] }] },
  { country: "Italy", flag: "🇮🇹", region: "Europe", aliases: ["Italy"], systems: [{ name: "Satispay", status: "Active", pspProviders: ["Satispay"] }] },
  { country: "Greece", flag: "🇬🇷", region: "Europe", aliases: ["Greece"], systems: [{ name: "IRIS", status: "Active", pspProviders: ["DIAS", "participating Greek banks"] }] },
]

export const qrNews = [
  { country: "Indonesia", system: "QRIS", headline: "Expanded PSP routing coverage tracked", description: "White Wallet and SQRIL are listed for Indonesian QRIS acceptance coverage.", date: "2026-05-05" },
  { country: "Thailand", system: "PromptPay", headline: "Cross-border QR PSP watch updated", description: "GLN and White Wallet entries are grouped under PromptPay for corridor planning.", date: "2026-05-04" },
  { country: "Egypt", system: "Meeza QR", headline: "Merchant acquiring provider list refreshed", description: "Meeza QR shows Ebanx, Paysky, Paymob and Banque Misr in the current provider registry.", date: "2026-05-03" },
  { country: "Brazil", system: "PIX QR", headline: "PIX QR remains high-priority in Latin America", description: "Provider mapping includes IM Solutions / HG Cash and SQRIL.", date: "2026-05-02" },
  { country: "Malaysia", system: "DuitNow QR", headline: "DuitNow PSP coverage mapped", description: "Paynet, Hitpay, GLN and White Wallet are shown as PSP providers.", date: "2026-05-02" },
  { country: "Pakistan", system: "Raast QR", headline: "Bank and wallet provider mix added", description: "NayaPay, Faysal Bank, MobilinkBank, PayFast and JS Bank are grouped under Raast QR.", date: "2026-05-01" },
  { country: "Vietnam", system: "VietQR", headline: "Vietnam PSP list expanded", description: "ArtismPay, FinFan, GLN, SQRIL and White Wallet are included in the provider list.", date: "2026-04-30" },
  { country: "Uzbekistan", system: "UZ QR", headline: "Multiple Uzbek QR systems shown", description: "UZ QR and Xolis Paynet are split into separate cards in the detail drawer.", date: "2026-04-29" },
  { country: "Philippines", system: "QRPH", headline: "QRPH PSP chips updated", description: "Coins.ph, PayMongo, GLN, SQRIL and White Wallet are visible in the country detail drawer.", date: "2026-04-28" },
  { country: "Japan", system: "PayPay QR", headline: "PayPay provider map checked", description: "PayPay, DJFT/PayPay and GLN are listed in the current dataset.", date: "2026-04-27" },
  { country: "Poland", system: "BLIK", headline: "European A2A payment methods added", description: "BLIK, Bizum, Satispay, IRIS and Wero are now represented in the map dataset.", date: "2026-04-26" },
]
