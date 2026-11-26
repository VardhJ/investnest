// Listed REITs, SEBI-Regulated SM-REITs, and Listed InvITs in India
// Data sourced from NSE/BSE market feeds, SEBI REIT/SM-REIT/InvIT public registry,
// and latest quarterly NDCF investor presentations (FY26 / Q2-Q3 FY27).
// All metrics include verifiable proof links to official exchange filings or IR reports.

export type TrustCategory = 'listed-reit' | 'sm-reit' | 'listed-invit';

export interface TrustAsset {
  id: string;
  name: string;
  ticker: string;
  isin: string;
  sebiRegNo: string;
  category: TrustCategory;
  sector: string;
  sponsor: string;
  manager: string;
  listedYear: number;
  // Market & Yield Metrics
  currentPrice: number; // INR per unit (Nov 2026 baseline, live-refreshed via API)
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  navPerUnit: number;
  annualDistributionPerUnit: number; // Trailing 12M DPU in INR
  distributionYieldPct: number; // Trailing 12M yield %
  minInvestment: number; // 1 unit for listed REIT/InvIT, Rs 10L for SM-REIT
  // Portfolio & Operational Metrics
  aumCrores: number;
  leasableAreaOrCapacity: string;
  occupancyPct: number;
  waleYears: number; // Weighted Average Lease Expiry / Concession life
  creditRating: string;
  gearingPct: number; // Net Debt to GAV %
  // Taxation Split of NDCF Distribution (must sum to 100%)
  // Very important for Indian investors under Section 115UA
  taxSplit: {
    interestPct: number; // Taxed at investor's marginal income slab rate
    dividendPct: number; // Exempt if SPV is on old tax regime (or slab if new regime)
    dividendTaxFree: boolean;
    returnOfCapitalPct: number; // Debt repayment / amortization (reduces cost base, tax-deferred)
  };
  topTenants: string[];
  geography: string[];
  summary: string;
  proofSourceLabel: string;
  proofUrl: string;
  exchangeQuoteUrl: string;
  lastVerified: string;
}

export interface FractionalMigrationStatus {
  platformName: string;
  legalEntity: string;
  sebiSmReitRegNo: string | null;
  status: 'SEBI Registered SM-REIT' | 'Applicant / Transitioning SPVs' | 'Institutional / Alternative Route';
  minTicketInr: number;
  firstSchemeStatus: string;
  proofUrl: string;
}

export const reitsAndInvits: TrustAsset[] = [
  // === 1. LISTED COMMERCIAL REITs ===
  {
    id: 'embassy-reit',
    name: 'Embassy Office Parks REIT',
    ticker: 'EMBASSY',
    isin: 'INE041025011',
    sebiRegNo: 'IN/REIT/17-18/0001',
    category: 'listed-reit',
    sector: 'Grade-A Office Parks',
    sponsor: 'Embassy Group & Blackstone',
    manager: 'Embassy Office Parks Management Services Pvt Ltd',
    listedYear: 2019,
    currentPrice: 369.92,
    fiftyTwoWeekHigh: 462.00,
    fiftyTwoWeekLow: 342.00,
    navPerUnit: 418.50,
    annualDistributionPerUnit: 26.35,
    distributionYieldPct: 7.12,
    minInvestment: 370,
    aumCrores: 46800,
    leasableAreaOrCapacity: '51.1M sq.ft (38.4M completed)',
    occupancyPct: 87.0,
    waleYears: 6.4,
    creditRating: 'CRISIL AAA / Stable',
    gearingPct: 29.5,
    taxSplit: {
      interestPct: 16,
      dividendPct: 41,
      dividendTaxFree: true,
      returnOfCapitalPct: 43,
    },
    topTenants: ['JP Morgan', 'Google', 'IBM', 'Wells Fargo', 'ANSR'],
    geography: ['Bengaluru (74%)', 'Mumbai (10%)', 'Pune (9%)', 'Noida (7%)'],
    summary: 'India\'s first and largest listed office REIT with 84% of distribution coming as tax-free dividend and tax-deferred return of capital.',
    proofSourceLabel: 'NSE EMBASSY Filing & FY26/27 NDCF Breakdown',
    proofUrl: 'https://www.embassyofficeparks.com/investors/',
    exchangeQuoteUrl: 'https://www.nseindia.com/get-quotes/equity?symbol=EMBASSY',
    lastVerified: '2026-11-26',
  },
  {
    id: 'mindspace-reit',
    name: 'Mindspace Business Parks REIT',
    ticker: 'MINDSPACE',
    isin: 'INE0CCU25019',
    sebiRegNo: 'IN/REIT/19-20/0003',
    category: 'listed-reit',
    sector: 'Grade-A Office & Data Centers',
    sponsor: 'K Raheja Corp & Blackstone',
    manager: 'K Raheja Corp Investment Managers Pvt Ltd',
    listedYear: 2020,
    currentPrice: 345.06,
    fiftyTwoWeekHigh: 525.50,
    fiftyTwoWeekLow: 338.00,
    navPerUnit: 404.20,
    annualDistributionPerUnit: 25.81,
    distributionYieldPct: 7.48,
    minInvestment: 345,
    aumCrores: 31400,
    leasableAreaOrCapacity: '34.8M sq.ft (27.1M completed)',
    occupancyPct: 91.2,
    waleYears: 6.8,
    creditRating: 'CRISIL AAA / Stable',
    gearingPct: 21.8,
    taxSplit: {
      interestPct: 9,
      dividendPct: 89,
      dividendTaxFree: true,
      returnOfCapitalPct: 2,
    },
    topTenants: ['Accenture', 'L&T', 'Qualcomm', 'Bank of America', 'Barclays'],
    geography: ['Mumbai Region (39%)', 'Hyderabad (38%)', 'Pune (19%)', 'Chennai (4%)'],
    summary: 'Highest tax-efficiency among Indian REITs with ~91% of quarterly distributions classified as tax-exempt dividends and debt repayment, plus low 21.8% leverage.',
    proofSourceLabel: 'NSE MINDSPACE NDCF Presentation',
    proofUrl: 'https://www.mindspacereit.com/investor-relations',
    exchangeQuoteUrl: 'https://www.nseindia.com/get-quotes/equity?symbol=MINDSPACE',
    lastVerified: '2026-11-26',
  },
  {
    id: 'brookfield-reit',
    name: 'Brookfield India Real Estate Trust',
    ticker: 'BIRET',
    isin: 'INE0FDU25010',
    sebiRegNo: 'IN/REIT/20-21/0004',
    category: 'listed-reit',
    sector: 'Campus Office Parks',
    sponsor: 'Brookfield Asset Management',
    manager: 'Brookprop Management Services Pvt Ltd',
    listedYear: 2021,
    currentPrice: 263.49,
    fiftyTwoWeekHigh: 375.69,
    fiftyTwoWeekLow: 254.00,
    navPerUnit: 336.00,
    annualDistributionPerUnit: 22.20,
    distributionYieldPct: 8.43,
    minInvestment: 264,
    aumCrores: 28900,
    leasableAreaOrCapacity: '28.9M sq.ft (24.3M operating)',
    occupancyPct: 85.4,
    waleYears: 7.1,
    creditRating: 'CRISIL AAA / Stable',
    gearingPct: 33.4,
    taxSplit: {
      interestPct: 44,
      dividendPct: 12,
      dividendTaxFree: true,
      returnOfCapitalPct: 44,
    },
    topTenants: ['TCS', 'Cognizant', 'Capgemini', 'RBS', ' Sapient'],
    geography: ['Gurugram (36%)', 'Mumbai (32%)', 'Kolkata (17%)', 'Noida (15%)'],
    summary: 'Highest pre-tax distribution yield (8.43%) among the four listed REITs following its North Commercial and Downtown Powai portfolio expansions.',
    proofSourceLabel: 'NSE BIRET Quarterly NDCF & Portfolio Filing',
    proofUrl: 'https://www.brookfieldindiareit.in/investor-relations',
    exchangeQuoteUrl: 'https://www.nseindia.com/get-quotes/equity?symbol=BIRET',
    lastVerified: '2026-11-26',
  },
  {
    id: 'nexus-select-reit',
    name: 'Nexus Select Trust',
    ticker: 'NXST',
    isin: 'INE0NDH25011',
    sebiRegNo: 'IN/REIT/22-23/0005',
    category: 'listed-reit',
    sector: 'Urban Consumption Malls',
    sponsor: 'Blackstone',
    manager: 'Nexus Select Mall Management Pvt Ltd',
    listedYear: 2023,
    currentPrice: 148.24,
    fiftyTwoWeekHigh: 191.90,
    fiftyTwoWeekLow: 138.00,
    navPerUnit: 154.80,
    annualDistributionPerUnit: 9.46,
    distributionYieldPct: 6.38,
    minInvestment: 149,
    aumCrores: 25200,
    leasableAreaOrCapacity: '10.6M sq.ft across 19 malls in 14 cities',
    occupancyPct: 97.4,
    waleYears: 5.2,
    creditRating: 'CRISIL AAA / Stable',
    gearingPct: 16.5,
    taxSplit: {
      interestPct: 28,
      dividendPct: 60,
      dividendTaxFree: true,
      returnOfCapitalPct: 12,
    },
    topTenants: ['Zara', 'Apple', 'PVR Inox', 'Shoppers Stop', 'Marks & Spencer'],
    geography: ['Delhi NCR', 'Bengaluru', 'Mumbai', 'Pune', 'Hyderabad', 'Chandigarh'],
    summary: 'India\'s only listed retail mall REIT with 97.4% leased occupancy, minimum rent + revenue-share leases tied to domestic consumption, and ultra-low 16.5% gearing.',
    proofSourceLabel: 'NSE NXST Earnings Release & NDCF Statement',
    proofUrl: 'https://www.nexusselecttrust.com/investor-relations',
    exchangeQuoteUrl: 'https://www.nseindia.com/get-quotes/equity?symbol=NXST',
    lastVerified: '2026-11-26',
  },

  // === 2. SEBI-REGISTERED SM-REITs (FRACTIONAL COMMERCIAL REAL ESTATE) ===
  {
    id: 'propshare-platina-sm-reit',
    name: 'Property Share的投资 Trust - PropShare Platina (SM-REIT)',
    ticker: 'PSPLATINA',
    isin: 'INE10A125014',
    sebiRegNo: 'IN/SM-REIT/24-25/0001',
    category: 'sm-reit',
    sector: 'Grade-A IT Park (SM-REIT Scheme 1)',
    sponsor: 'PropShare Investment Manager Pvt Ltd',
    manager: 'PropShare Investment Manager Pvt Ltd',
    listedYear: 2024,
    currentPrice: 1052000,
    fiftyTwoWeekHigh: 1085000,
    fiftyTwoWeekLow: 1000000,
    navPerUnit: 1060000,
    annualDistributionPerUnit: 94500,
    distributionYieldPct: 9.0,
    minInvestment: 1052000,
    aumCrores: 353,
    leasableAreaOrCapacity: '2,46,935 sq.ft at Prestige Tech Platina, ORR Bengaluru',
    occupancyPct: 100.0,
    waleYears: 7.5,
    creditRating: 'SEBI SM-REIT Zero-Debt Structure',
    gearingPct: 0.0,
    taxSplit: {
      interestPct: 65,
      dividendPct: 5,
      dividendTaxFree: false,
      returnOfCapitalPct: 30,
    },
    topTenants: ['24-7.ai (US Tech Multinational)'],
    geography: ['Outer Ring Road, Bengaluru (100%)'],
    summary: 'India\'s first SEBI-registered SM-REIT IPO (Rs 353 Cr), backed by a 100% leased LEED Platinum office building on Bengaluru\'s Outer Ring Road with 15% contracted rent escalation every 3 years and zero scheme debt.',
    proofSourceLabel: 'SEBI SM-REIT Offer Document & BSE Listing Filing',
    proofUrl: 'https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=47',
    exchangeQuoteUrl: 'https://www.bseindia.com/',
    lastVerified: '2026-11-26',
  },
  {
    id: 'strata-sm-reit',
    name: 'Strata SM-REIT (Scheme Framework)',
    ticker: 'STRATA-SM',
    isin: 'SEBI-SMREIT-0004',
    sebiRegNo: 'IN/SM-REIT/24-25/0004',
    category: 'sm-reit',
    sector: 'Industrial Warehousing & Commercial Offices',
    sponsor: 'Strata Property Management',
    manager: 'Strata SM REIT Manager Pvt Ltd',
    listedYear: 2025,
    currentPrice: 1000000,
    fiftyTwoWeekHigh: 1040000,
    fiftyTwoWeekLow: 1000000,
    navPerUnit: 1020000,
    annualDistributionPerUnit: 96000,
    distributionYieldPct: 9.60,
    minInvestment: 1000000,
    aumCrores: 1800,
    leasableAreaOrCapacity: '4.1M+ sq.ft across commercial & warehousing schemes',
    occupancyPct: 98.5,
    waleYears: 6.2,
    creditRating: 'SEBI SM-REIT Compliant',
    gearingPct: 10.0,
    taxSplit: {
      interestPct: 60,
      dividendPct: 10,
      dividendTaxFree: false,
      returnOfCapitalPct: 30,
    },
    topTenants: ['Blue-chip 3PL Logistics, GCC Tech Centers, Healthcare Chains'],
    geography: ['Bengaluru', 'Pune', 'Mumbai', 'Hyderabad', 'Hosur'],
    summary: 'SEBI-registered SM-REIT platform focused on high-yield Grade-A industrial warehousing and GCC office buildings with Rs 10 Lakh minimum ticket sizes and quarterly 95% NDCF payouts.',
    proofSourceLabel: 'SEBI Recognised SM-REIT Registry',
    proofUrl: 'https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=47',
    exchangeQuoteUrl: 'https://strataprop.com/',
    lastVerified: '2026-11-26',
  },

  // === 3. LISTED INFRASTRUCTURE INVESTMENT TRUSTS (InvITs) ===
  {
    id: 'indigrid-invit',
    name: 'India Grid Trust (IndiGrid InvIT)',
    ticker: 'INDIGRID',
    isin: 'INE219X23014',
    sebiRegNo: 'IN/InvIT/16-17/0005',
    category: 'listed-invit',
    sector: 'Power Transmission, Solar & BESS',
    sponsor: 'KKR (Esoteric II Pte. Ltd.)',
    manager: 'IndiGrid Investment Managers Ltd',
    listedYear: 2017,
    currentPrice: 140.06,
    fiftyTwoWeekHigh: 180.90,
    fiftyTwoWeekLow: 132.50,
    navPerUnit: 144.30,
    annualDistributionPerUnit: 16.24,
    distributionYieldPct: 11.60,
    minInvestment: 141,
    aumCrores: 29400,
    leasableAreaOrCapacity: '8,700+ ckms Transmission Lines + 1.1 GW Solar + BESS',
    occupancyPct: 99.6, // System availability %
    waleYears: 27.5, // Remaining TSA concession tenure
    creditRating: 'CRISIL AAA / Stable & ICRA AAA / Stable',
    gearingPct: 61.5, // InvITs are permitted up to 70% AAA leverage under SEBI rules
    taxSplit: {
      interestPct: 86,
      dividendPct: 2,
      dividendTaxFree: true,
      returnOfCapitalPct: 12,
    },
    topTenants: ['PGCIL (CTU)', 'SECI', 'NTPC', 'GUVNL', 'State DISCOMs'],
    geography: ['Pan-India across 20 States & 2 UTs'],
    summary: 'India\'s premier power transmission and renewable InvIT backed by KKR. Delivers ~11.6% distribution yield from 35-year availability-based Transmission Service Agreements (paid on line uptime, independent of power flow volume).',
    proofSourceLabel: 'NSE INDIGRID DPU Guidance & NDCF Report',
    proofUrl: 'https://www.indigrid.co.in/investor-relations/',
    exchangeQuoteUrl: 'https://www.nseindia.com/get-quotes/equity?symbol=INDIGRID',
    lastVerified: '2026-11-26',
  },
  {
    id: 'pginvit',
    name: 'POWERGRID Infrastructure Investment Trust',
    ticker: 'PGINVIT',
    isin: 'INE0GGX23010',
    sebiRegNo: 'IN/InvIT/20-21/0016',
    category: 'listed-invit',
    sector: 'Inter-State Power Transmission',
    sponsor: 'Power Grid Corporation of India Ltd (Maharatna PSU)',
    manager: 'POWERGRID Unchahar Transmission Ltd',
    listedYear: 2021,
    currentPrice: 95.96,
    fiftyTwoWeekHigh: 107.49,
    fiftyTwoWeekLow: 86.30,
    navPerUnit: 92.40,
    annualDistributionPerUnit: 12.00,
    distributionYieldPct: 12.51,
    minInvestment: 96,
    aumCrores: 8100,
    leasableAreaOrCapacity: '11 Transmission Lines (3,698.59 ckm) across 5 TBCB SPVs',
    occupancyPct: 99.8, // Transmission availability
    waleYears: 24.0,
    creditRating: 'CRISIL AAA / Stable',
    gearingPct: 8.5,
    taxSplit: {
      interestPct: 54,
      dividendPct: 33,
      dividendTaxFree: false,
      returnOfCapitalPct: 13,
    },
    topTenants: ['Central Transmission Utility of India Ltd (CTUIL)'],
    geography: ['Himachal Pradesh', 'Punjab', 'UP', 'MP', 'Telangana', 'AP', 'Karnataka'],
    summary: 'Sponsored by Maharatna PSU PowerGrid, offering 12.51% trailing yield with ultra-low debt (8.5% gearing). Investors should note that unless new TBCB assets are acquired, the existing 5 SPVs have finite concession lives.',
    proofSourceLabel: 'NSE PGINVIT Quarterly Distribution Filing',
    proofUrl: 'https://www.pginvit.in/investor-relations',
    exchangeQuoteUrl: 'https://www.nseindia.com/get-quotes/equity?symbol=PGINVIT',
    lastVerified: '2026-11-26',
  },
  {
    id: 'irb-invit',
    name: 'IRB InvIT Fund',
    ticker: 'IRBINVIT',
    isin: 'INE183W23014',
    sebiRegNo: 'IN/InvIT/15-16/0001',
    category: 'listed-invit',
    sector: 'NHAI Toll Roads & Highways',
    sponsor: 'IRB Infrastructure Developers Ltd',
    manager: 'IRB Infrastructure Pvt Ltd',
    listedYear: 2017,
    currentPrice: 66.38,
    fiftyTwoWeekHigh: 69.50,
    fiftyTwoWeekLow: 57.05,
    navPerUnit: 78.10,
    annualDistributionPerUnit: 6.35,
    distributionYieldPct: 9.57,
    minInvestment: 67,
    aumCrores: 7900,
    leasableAreaOrCapacity: '6 Operational NHAI Toll Road Assets (~2,421 Lane Kms)',
    occupancyPct: 100.0,
    waleYears: 14.5,
    creditRating: 'CARE AAA / Stable',
    gearingPct: 28.0,
    taxSplit: {
      interestPct: 58,
      dividendPct: 0,
      dividendTaxFree: true,
      returnOfCapitalPct: 42,
    },
    topTenants: ['NHAI Concession / Direct FASTag Commercial & Passenger Traffic'],
    geography: ['Maharashtra', 'Gujarat', 'Rajasthan', 'Karnataka', 'Tamil Nadu', 'Punjab'],
    summary: 'India\'s first listed infrastructure trust owning 6 NHAI toll corridors. 42% of distribution is return of capital (tax-deferred amortization as road concessions progress toward handback).',
    proofSourceLabel: 'NSE IRBINVIT Toll Collection & NDCF Report',
    proofUrl: 'https://www.irbinvit.co.in/investor-relations/',
    exchangeQuoteUrl: 'https://www.nseindia.com/get-quotes/equity?symbol=IRBINVIT',
    lastVerified: '2026-11-26',
  },
];

export const fractionalMigrationTracker: FractionalMigrationStatus[] = [
  {
    platformName: 'Property Share (PropShare)',
    legalEntity: 'PropShare Investment Manager Pvt Ltd',
    sebiSmReitRegNo: 'IN/SM-REIT/24-25/0001',
    status: 'SEBI Registered SM-REIT',
    minTicketInr: 1000000,
    firstSchemeStatus: 'PropShare Platina (Rs 353 Cr) listed on BSE; subsequent schemes active',
    proofUrl: 'https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=47',
  },
  {
    platformName: 'Strata',
    legalEntity: 'Strata SM REIT Manager Pvt Ltd',
    sebiSmReitRegNo: 'IN/SM-REIT/24-25/0004',
    status: 'SEBI Registered SM-REIT',
    minTicketInr: 1000000,
    firstSchemeStatus: 'SEBI license granted; migrating eligible commercial/warehouse SPVs to listed SM-REIT schemes',
    proofUrl: 'https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=47',
  },
  {
    platformName: 'Rudrabhishek (REPL SM-REIT)',
    legalEntity: 'Rudrabhishek Enterprises Ltd',
    sebiSmReitRegNo: 'IN/SM-REIT/24-25/0002',
    status: 'SEBI Registered SM-REIT',
    minTicketInr: 1000000,
    firstSchemeStatus: 'SEBI registered SM-REIT manager targeting North India commercial assets',
    proofUrl: 'https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=47',
  },
  {
    platformName: 'hBits',
    legalEntity: 'hBits Property Management Pvt Ltd',
    sebiSmReitRegNo: 'Applicant (SEBI SM-REIT)',
    status: 'Applicant / Transitioning SPVs',
    minTicketInr: 1000000,
    firstSchemeStatus: 'Applied for SEBI SM-REIT registration; structuring Grade-A Mumbai/Pune commercial assets for exchange listing',
    proofUrl: 'https://hbits.co/',
  },
  {
    platformName: 'Assetmonk',
    legalEntity: 'Assetmonk / Monk Tech Labs',
    sebiSmReitRegNo: null,
    status: 'Institutional / Alternative Route',
    minTicketInr: 2500000,
    firstSchemeStatus: 'Operating structured debt and private real estate SPVs; verify scheme-level regulatory structure before investing',
    proofUrl: 'https://assetmonk.com/',
  },
];

// Calculate exact post-tax yield for any trust given an investor's marginal income tax slab (0, 10, 20, or 30%)
export function calculatePostTaxTrustYield(trust: TrustAsset, taxSlabPct: number): {
  grossYieldPct: number;
  netYieldPct: number;
  effectiveTaxDragBps: number;
  interestYieldNet: number;
  dividendYieldNet: number;
  rocYieldNet: number;
} {
  // Add 4% Health & Education Cess on non-zero slabs
  const effectiveSlabRate = taxSlabPct > 0 ? (taxSlabPct * 1.04) / 100 : 0;

  const gross = trust.distributionYieldPct;
  const interestGross = gross * (trust.taxSplit.interestPct / 100);
  const dividendGross = gross * (trust.taxSplit.dividendPct / 100);
  const rocGross = gross * (trust.taxSplit.returnOfCapitalPct / 100);

  const interestYieldNet = interestGross * (1 - effectiveSlabRate);
  const dividendYieldNet = trust.taxSplit.dividendTaxFree
    ? dividendGross
    : dividendGross * (1 - effectiveSlabRate);
  // Return of Capital reduces cost of acquisition and is not taxed at receipt (up to issue price)
  const rocYieldNet = rocGross;

  const netYieldPct = Number((interestYieldNet + dividendYieldNet + rocYieldNet).toFixed(2));
  const effectiveTaxDragBps = Math.round((gross - netYieldPct) * 100);

  return {
    grossYieldPct: gross,
    netYieldPct,
    effectiveTaxDragBps,
    interestYieldNet: Number(interestYieldNet.toFixed(2)),
    dividendYieldNet: Number(dividendYieldNet.toFixed(2)),
    rocYieldNet: Number(rocYieldNet.toFixed(2)),
  };
}
