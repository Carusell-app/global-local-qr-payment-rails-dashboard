export type Confidence = "low" | "medium" | "high"

export type CountryPaymentProfile = {
  id: string
  slug: string
  countryName: string
  iso2: string
  iso3: string
  region: string
  subregion?: string
  flagEmoji?: string
  coordinates: {
    lat: number
    lng: number
  }
  currency: {
    name: string
    code: string
    symbol?: string
    settlementNotes?: string
  }
  localSystems: LocalPaymentSystem[]
  cryptoRegulation: CryptoRegulationProfile
  banksAndPsps: Participant[]
  merchantCoverage: MerchantCoverageProfile
  interoperability: InteroperabilityCorridor[]
  news: NewsItem[]
  sources: SourceReference[]
  pspOpportunity: PspOpportunityAssessment
  dataQuality: DataQualityProfile
}

export type LocalPaymentSystem = {
  id: string
  name: string
  localBrandName?: string
  type: Array<
    | "national_qr"
    | "instant_payment"
    | "wallet_network"
    | "national_switch"
    | "card_scheme"
    | "bank_transfer"
    | "other"
  >
  operator?: string
  regulator?: string
  launchYear?: number
  status: "planned" | "pilot" | "active" | "mature" | "restricted" | "unknown"
  qrStandard?: "emvco" | "proprietary" | "hybrid" | "unknown"
  qrModes?: Array<"CPM" | "MPM">
  useCases: string[]
  accessModel?: string
  settlementModel?: string
  documentationUrls?: string[]
  notes?: string
  confidence: Confidence
}

export type CryptoRegulationProfile = {
  legalStatus: "legal" | "regulated" | "restricted" | "banned" | "unclear"
  cryptoPaymentsAllowed: "yes" | "no" | "licensed_only" | "unclear"
  exchangesAllowed: "yes" | "licensed_only" | "no" | "unclear"
  stablecoinStatus?: "allowed" | "regulated" | "restricted" | "banned" | "unclear"
  cbdcStatus?: "none" | "research" | "pilot" | "launched" | "unknown"
  regulator?: string
  amlKycNotes?: string
  taxNotes?: string
  riskSummary?: string
  lastUpdated: string
  confidence: Confidence
  sources: string[]
}

export type Participant = {
  id: string
  name: string
  type:
    | "bank"
    | "psp"
    | "wallet"
    | "acquirer"
    | "processor"
    | "gateway"
    | "aggregator"
    | "regulator"
    | "scheme"
    | "other"
  role: string
  accessRoute?: "direct_member" | "sponsor_bank" | "acquirer" | "aggregator" | "local_license_required" | "unknown"
  capabilities?: string[]
  website?: string
  confidence: Confidence
  lastVerified?: string
}

export type MerchantCoverageProfile = {
  level: "low" | "medium" | "high" | "nationwide" | "unknown"
  estimatedMerchants?: number
  merchantCategories: string[]
  knownChains?: string[]
  qrTypes: Array<"static" | "dynamic" | "pos_integrated" | "app_generated" | "unknown">
  onlineAcceptance: boolean | "unknown"
  offlineAcceptance: boolean | "unknown"
  notes?: string
  confidence: Confidence
}

export type InteroperabilityCorridor = {
  id: string
  sourceCountry: string
  targetCountry: string
  sourceSystem?: string
  targetSystem?: string
  status: "live" | "pilot" | "announced" | "planned" | "unclear"
  networkOrOperator?: string
  useCases: string[]
  launchDate?: string
  settlementNotes?: string
  fxNotes?: string
  merchantAcceptanceNotes?: string
  pspRelevance?: string
  sources: string[]
  confidence: Confidence
}

export type NewsItem = {
  id: string
  countrySlug: string
  title: string
  summary: string
  date: string
  sourceName: string
  sourceUrl?: string
  sourceType:
    | "official"
    | "central_bank"
    | "regulator"
    | "fintech_media"
    | "blog"
    | "press_release"
    | "company"
    | "government"
    | "other"
  category:
    | "regulation"
    | "interoperability"
    | "merchant_rollout"
    | "bank_participation"
    | "crypto"
    | "cbdc"
    | "psp_access"
    | "product_launch"
    | "fraud_risk"
    | "other"
  whyItMattersForPsps: string
  relatedCountries?: string[]
  relatedSystems?: string[]
  confidence: Confidence
  parsedAt?: string
}

export type SourceReference = {
  id: string
  title: string
  url: string
  sourceType:
    | "official_system_site"
    | "central_bank"
    | "regulator"
    | "api_docs"
    | "fintech_media"
    | "blog"
    | "company_announcement"
    | "government"
    | "other"
  reliability: Confidence
  lastChecked?: string
  notes?: string
}

export type PspOpportunityAssessment = {
  opportunityScore: number
  marketAttractiveness: number
  accessDifficulty: number
  regulatoryComplexity: number
  crossBorderPotential: number
  merchantReadiness: number
  consumerAdoptionSignal: number
  cryptoCompatibility: number
  suggestedRouteToMarket?: string
  keyOpenQuestions: string[]
}

export type DataQualityProfile = {
  lastUpdated: string
  lastSourceCheck?: string
  numberOfSources: number
  confidenceByCategory: {
    qrSystem: Confidence
    banksPsps: Confidence
    interoperability: Confidence
    merchantCoverage: Confidence
    cryptoRegulation: Confidence
    news: Confidence
  }
  warnings: string[]
}

export type CountryFilters = {
  query?: string
  region?: string
  qrAvailability?: "all" | "yes" | "no" | "unknown"
  crossBorderEnabled?: "all" | "yes" | "no"
  cryptoStatus?: CryptoRegulationProfile["legalStatus"] | "all"
  currency?: string
  paymentScenario?: string
  qrMode?: "CPM" | "MPM" | "all"
  merchantCoverage?: MerchantCoverageProfile["level"] | "all"
  pspAccessClarity?: Participant["accessRoute"] | "all"
  dataFreshness?: "all" | "30d" | "90d" | "stale"
  regulatoryRisk?: "all" | "low" | "medium" | "high"
}
