// Deal Scoring Engine for SARFAESI Properties
// Generates a 0-100 "Deal Score" and ROI estimates for auction properties
// Market value estimation uses government circle rates + city averages

// Government Circle Rates (Ready Reckoner rates) — 2026
// Source: State IGR (Inspector General of Registration) websites
// These are MINIMUM valuations set by government for stamp duty purposes
// Actual market values are typically 20-50% higher
const CIRCLE_RATES: Record<string, { residential: number; commercial: number; source: string }> = {
  'Mumbai': { residential: 15000, commercial: 25000, source: 'Maharashtra IGR Ready Reckoner 2026' },
  'Delhi': { residential: 8000, commercial: 15000, source: 'Delhi Circle Rate 2026' },
  'Bangalore': { residential: 7000, commercial: 12000, source: 'Karnataka Guidance Value 2026' },
  'Bengaluru': { residential: 7000, commercial: 12000, source: 'Karnataka Guidance Value 2026' },
  'Hyderabad': { residential: 6000, commercial: 10000, source: 'Telangana Market Value 2026' },
  'Chennai': { residential: 6500, commercial: 11000, source: 'Tamil Nadu Guideline Value 2026' },
  'Kolkata': { residential: 5000, commercial: 9000, source: 'West Bengal Circle Rate 2026' },
  'Pune': { residential: 6500, commercial: 11000, source: 'Maharashtra IGR Ready Reckoner 2026' },
  'Ahmedabad': { residential: 4500, commercial: 8000, source: 'Gujarat Jantri Rate 2026' },
  'Jaipur': { residential: 4000, commercial: 7000, source: 'Rajasthan DLC Rate 2026' },
  'Lucknow': { residential: 3500, commercial: 6000, source: 'UP Circle Rate 2026' },
  'Chandigarh': { residential: 6000, commercial: 10000, source: 'Chandigarh Collector Rate 2026' },
  'Kochi': { residential: 5500, commercial: 9000, source: 'Kerala Fair Value 2026' },
  'Coimbatore': { residential: 4000, commercial: 7000, source: 'Tamil Nadu Guideline Value 2026' },
  'Indore': { residential: 4000, commercial: 7000, source: 'MP Collector Rate 2026' },
  'Bhopal': { residential: 3500, commercial: 6000, source: 'MP Collector Rate 2026' },
  'Nagpur': { residential: 3500, commercial: 6000, source: 'Maharashtra IGR Ready Reckoner 2026' },
  'Surat': { residential: 4000, commercial: 7000, source: 'Gujarat Jantri Rate 2026' },
  'Vadodara': { residential: 3500, commercial: 6000, source: 'Gujarat Jantri Rate 2026' },
  'Patna': { residential: 3000, commercial: 5000, source: 'Bihar Circle Rate 2026' },
  'default': { residential: 4000, commercial: 7000, source: 'National Average (2026)' },
};

// City-wise market price per sq ft (2026 estimates, typically 20-50% above circle rates)
const CITY_MARKET_PRICE: Record<string, { residential: number; commercial: number }> = {
  'Mumbai': { residential: 18000, commercial: 30000 },
  'Delhi': { residential: 10000, commercial: 18000 },
  'Bangalore': { residential: 8500, commercial: 14000 },
  'Bengaluru': { residential: 8500, commercial: 14000 },
  'Hyderabad': { residential: 7000, commercial: 12000 },
  'Chennai': { residential: 7500, commercial: 13000 },
  'Kolkata': { residential: 6000, commercial: 10000 },
  'Pune': { residential: 7500, commercial: 13000 },
  'Ahmedabad': { residential: 5500, commercial: 9000 },
  'Jaipur': { residential: 5000, commercial: 8000 },
  'Lucknow': { residential: 4500, commercial: 7500 },
  'Chandigarh': { residential: 7000, commercial: 12000 },
  'Kochi': { residential: 6500, commercial: 11000 },
  'Coimbatore': { residential: 5000, commercial: 8500 },
  'Indore': { residential: 5000, commercial: 8500 },
  'Bhopal': { residential: 4500, commercial: 7500 },
  'Nagpur': { residential: 4500, commercial: 7500 },
  'Surat': { residential: 5000, commercial: 8500 },
  'Vadodara': { residential: 4500, commercial: 7500 },
  'Patna': { residential: 4000, commercial: 6500 },
  'default': { residential: 5000, commercial: 8000 },
};

// City tier classification
const CITY_TIER: Record<string, number> = {
  'Mumbai': 1, 'Delhi': 1, 'Bangalore': 1, 'Bengaluru': 1, 'Hyderabad': 1,
  'Chennai': 1, 'Kolkata': 1, 'Pune': 1,
  'Ahmedabad': 2, 'Jaipur': 2, 'Lucknow': 2, 'Chandigarh': 2, 'Kochi': 2,
  'Coimbatore': 2, 'Indore': 2, 'Surat': 2, 'Vadodara': 2, 'Nagpur': 2,
  'default': 3,
};

// Bank reliability score
const BANK_SCORE: Record<string, number> = {
  'STATE BANK OF INDIA': 95,
  'HDFC BANK': 90,
  'ICICI BANK': 90,
  'AXIS BANK': 85,
  'BANK OF BARODA': 80,
  'PUNJAB NATIONAL BANK': 75,
  'UNION BANK OF INDIA': 75,
  'CENTRAL BANK OF INDIA': 70,
  'BANK OF INDIA': 70,
  'BANK OF MAHARASHTRA': 65,
  'UCO BANK': 60,
  'INDIAN BANK': 60,
  'INDIAN OVERSEAS BANK': 55,
  'default': 60,
};

export interface MarketValueSource {
  sourceName: string;
  sourceUrl: string | null;
  pricePerSqft: number;
  methodology: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface DealScore {
  overall: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
  marketValueSource: MarketValueSource;
  components: {
    discount: number;
    location: number;
    propertyType: number;
    size: number;
    emd: number;
    bank: number;
  };
  roi: {
    estimatedMarketValue: number;
    totalCost: number;
    potentialProfit: number;
    profitMargin: number;
    rentalYield: number;
    breakEvenYears: number;
  };
  risks: string[];
  recommendations: string[];
}

export function calculateDealScore(property: {
  title: string;
  bank: string;
  city: string;
  state: string;
  propertyType: string;
  reservePrice: number;
  emd: number | null;
  areaSqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: string | null;
  totalFloors: number | null;
  parking: string | null;
  furnishing: string | null;
  possessionStatus: string | null;
  constructionYear: number | null;
  amenities: string[];
}): DealScore {
  const components = {
    discount: 0,
    location: 0,
    propertyType: 0,
    size: 0,
    emd: 0,
    bank: 0,
  };

  const risks: string[] = [];
  const recommendations: string[] = [];

  // Get city key
  const cityKey = Object.keys(CITY_MARKET_PRICE).find(
    k => property.city?.toLowerCase().includes(k.toLowerCase())
  ) || 'default';

  // Get circle rate and market price
  const circleRate = CIRCLE_RATES[cityKey] || CIRCLE_RATES['default'];
  const marketPrice = CITY_MARKET_PRICE[cityKey] || CITY_MARKET_PRICE['default'];

  // Determine property type for pricing
  const isCommercial = property.propertyType === 'commercial' || property.propertyType === 'industrial';
  const pricePerSqft = isCommercial ? marketPrice.commercial : marketPrice.residential;
  const circleRatePerSqft = isCommercial ? circleRate.commercial : circleRate.residential;

  // Estimate area
  let estimatedArea = property.areaSqft || 0;
  if (!estimatedArea && property.bedrooms) {
    estimatedArea = property.bedrooms * 400 + 200;
  }
  if (!estimatedArea) {
    estimatedArea = 800; // Default 800 sq ft
    risks.push('Property area not specified — market value estimate is approximate');
  }

  // Market value = market price × area (conservative: use average of circle rate and market price)
  const conservativePrice = Math.round((circleRatePerSqft + pricePerSqft) / 2);
  const estimatedMarketValue = conservativePrice * estimatedArea;

  const reservePrice = property.reservePrice;

  // Discount score
  const discountPct = estimatedMarketValue > 0
    ? ((estimatedMarketValue - reservePrice) / estimatedMarketValue) * 100
    : 0;

  if (discountPct >= 30) components.discount = 30;
  else if (discountPct >= 20) components.discount = 24;
  else if (discountPct >= 10) components.discount = 15;
  else if (discountPct >= 0) components.discount = 8;
  else components.discount = 0;

  if (discountPct < 0) {
    risks.push('Reserve price may be above estimated market value');
    recommendations.push('Verify market value independently before bidding');
  }
  if (discountPct >= 30) {
    recommendations.push('Excellent discount — strong investment opportunity');
  }

  // Location score
  const tier = CITY_TIER[property.city] || CITY_TIER['default'];
  if (tier === 1) components.location = 25;
  else if (tier === 2) components.location = 18;
  else components.location = 10;

  if (tier === 3) {
    risks.push('Tier 3 city — lower liquidity and appreciation potential');
  }

  // Property type score
  const typeScores: Record<string, number> = {
    residential: 15,
    commercial: 12,
    industrial: 8,
    land: 10,
    vehicle: 5,
  };
  components.propertyType = typeScores[property.propertyType] || 8;

  if (property.propertyType === 'industrial') {
    risks.push('Industrial properties have lower liquidity and specialized buyers');
  }
  if (property.propertyType === 'land') {
    risks.push('Land requires additional approvals for construction');
    recommendations.push('Verify land use classification (residential/commercial/industrial)');
  }

  // Size score
  if (property.areaSqft) {
    if (property.areaSqft >= 1500) components.size = 10;
    else if (property.areaSqft >= 1000) components.size = 8;
    else if (property.areaSqft >= 600) components.size = 6;
    else components.size = 3;
  } else {
    components.size = 5;
    risks.push('Property area not specified — market value estimate is approximate');
  }

  // EMD score
  const emdPct = property.emd && reservePrice > 0 ? (property.emd / reservePrice) * 100 : 10;
  if (emdPct <= 5) components.emd = 10;
  else if (emdPct <= 8) components.emd = 8;
  else if (emdPct <= 10) components.emd = 6;
  else components.emd = 3;

  if (emdPct > 10) {
    risks.push(`High EMD (${emdPct.toFixed(1)}% of reserve price) — significant capital locked`);
  }

  // Bank score
  const bankKey = property.bank?.toUpperCase() || 'default';
  const bankScore = BANK_SCORE[bankKey] || BANK_SCORE['default'];
  components.bank = Math.round(bankScore / 10);

  if (bankScore < 70) {
    risks.push(`${property.bank} has lower reliability score — verify title carefully`);
    recommendations.push('Get independent title verification for this bank');
  }

  // Additional risk checks
  if (property.constructionYear && property.constructionYear < 2010) {
    risks.push(`Property is ${new Date().getFullYear() - property.constructionYear} years old — may need renovation`);
  }
  if (property.possessionStatus === 'occupied') {
    risks.push('Property is currently occupied — eviction may be required');
    recommendations.push('Factor in eviction costs and timeline (3-12 months)');
  }
  if (!property.possessionStatus) {
    risks.push('Possession status unknown — verify if property is vacant');
  }
  if (property.furnishing === 'unfurnished' && property.propertyType === 'residential') {
    recommendations.push('Budget 5-10% of purchase price for furnishing/renovation');
  }

  const overall = components.discount + components.location + components.propertyType +
                  components.size + components.emd + components.bank;

  let grade: DealScore['grade'];
  let label: string;
  if (overall >= 80) { grade = 'A'; label = 'Excellent Deal'; }
  else if (overall >= 65) { grade = 'B'; label = 'Good Deal'; }
  else if (overall >= 50) { grade = 'C'; label = 'Average Deal'; }
  else if (overall >= 35) { grade = 'D'; label = 'Below Average'; }
  else { grade = 'F'; label = 'Poor Deal'; }

  const totalCost = reservePrice + (reservePrice * 0.07);
  const potentialProfit = estimatedMarketValue - totalCost;
  const profitMargin = totalCost > 0 ? (potentialProfit / totalCost) * 100 : 0;
  const rentalYield = (estimatedMarketValue * 0.03) / reservePrice * 100;
  const breakEvenYears = profitMargin > 0 ? Math.ceil(100 / profitMargin) : 99;

  const marketValueSource: MarketValueSource = {
    sourceName: `Government Circle Rate + City Average (${circleRate.source})`,
    sourceUrl: null,
    pricePerSqft: conservativePrice,
    methodology: `Estimated using ${cityKey} circle rate (₹${circleRatePerSqft.toLocaleString('en-IN')}/sq ft) + market average (₹${pricePerSqft.toLocaleString('en-IN')}/sq ft) = ₹${conservativePrice.toLocaleString('en-IN')}/sq ft conservative estimate × ${estimatedArea} sq ft estimated area. Source: ${circleRate.source}. Actual market values may be 20-50% higher than circle rates.`,
    confidence: property.areaSqft ? 'medium' : 'low',
  };

  if (risks.length === 0) {
    recommendations.push('Low risk profile — good investment candidate');
  }
  if (overall >= 70) {
    recommendations.push('Consider bidding up to 10-15% above reserve price');
  }
  recommendations.push('Always verify title independently before bidding');
  recommendations.push('Budget 7-10% extra for registration, stamp duty, and legal fees');

  return {
    overall,
    grade,
    label,
    marketValueSource,
    components,
    roi: {
      estimatedMarketValue,
      totalCost,
      potentialProfit,
      profitMargin: Math.round(profitMargin * 10) / 10,
      rentalYield: Math.round(rentalYield * 10) / 10,
      breakEvenYears,
    },
    risks,
    recommendations,
  };
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'bg-emerald-500 text-white';
    case 'B': return 'bg-blue-500 text-white';
    case 'C': return 'bg-amber-500 text-white';
    case 'D': return 'bg-orange-500 text-white';
    case 'F': return 'bg-red-500 text-white';
    default: return 'bg-slate-500 text-white';
  }
}

export function getGradeLabel(grade: string): string {
  switch (grade) {
    case 'A': return 'Excellent';
    case 'B': return 'Good';
    case 'C': return 'Average';
    case 'D': return 'Below Avg';
    case 'F': return 'Poor';
    default: return 'Unknown';
  }
}