// Deal Scoring Engine for SARFAESI Properties
// Generates a 0-100 "Deal Score" and ROI estimates for auction properties

// City-wise average price per sq ft (INR) — based on 2026 market data
const CITY_PRICE_PER_SQFT: Record<string, number> = {
  'Mumbai': 12000, 'Delhi': 8000, 'Bangalore': 7000, 'Bengaluru': 7000,
  'Hyderabad': 6000, 'Chennai': 6500, 'Kolkata': 5000, 'Pune': 6500,
  'Ahmedabad': 4500, 'Jaipur': 4000, 'Lucknow': 3500, 'Chandigarh': 6000,
  'Kochi': 5500, 'Coimbatore': 4000, 'Indore': 4000, 'Bhopal': 3500,
  'Nagpur': 3500, 'Surat': 4000, 'Vadodara': 3500, 'Patna': 3000,
  'default': 4000,
};

// City tier classification
const CITY_TIER: Record<string, number> = {
  'Mumbai': 1, 'Delhi': 1, 'Bangalore': 1, 'Bengaluru': 1, 'Hyderabad': 1,
  'Chennai': 1, 'Kolkata': 1, 'Pune': 1,
  'Ahmedabad': 2, 'Jaipur': 2, 'Lucknow': 2, 'Chandigarh': 2, 'Kochi': 2,
  'Coimbatore': 2, 'Indore': 2, 'Surat': 2, 'Vadodara': 2, 'Nagpur': 2,
  'default': 3,
};

// Bank reliability score (title clarity, process efficiency)
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

export interface DealScore {
  overall: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
  components: {
    discount: number;      // 0-30
    location: number;      // 0-25
    propertyType: number;  // 0-15
    size: number;          // 0-10
    emd: number;           // 0-10
    bank: number;          // 0-10
  };
  roi: {
    estimatedMarketValue: number;
    totalCost: number;
    potentialProfit: number;
    profitMargin: number;  // percentage
    rentalYield: number;   // percentage
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

  // 1. Discount Score (0-30 points)
  // Estimate market value based on city price per sq ft and area
  const cityKey = Object.keys(CITY_PRICE_PER_SQFT).find(
    k => property.city?.toLowerCase().includes(k.toLowerCase())
  ) || 'default';
  const pricePerSqft = CITY_PRICE_PER_SQFT[cityKey] || CITY_PRICE_PER_SQFT['default'];

  let estimatedArea = property.areaSqft || 800; // Default 800 sq ft
  if (!property.areaSqft && property.bedrooms) {
    estimatedArea = property.bedrooms * 400 + 200; // Rough estimate
  }

  const estimatedMarketValue = pricePerSqft * estimatedArea;
  const reservePrice = property.reservePrice;

  // Discount = how much below market value
  const discountPct = estimatedMarketValue > 0
    ? ((estimatedMarketValue - reservePrice) / estimatedMarketValue) * 100
    : 0;

  if (discountPct >= 30) components.discount = 30;
  else if (discountPct >= 20) components.discount = 24;
  else if (discountPct >= 10) components.discount = 15;
  else if (discountPct >= 0) components.discount = 8;
  else components.discount = 0; // Overpriced

  if (discountPct < 0) {
    risks.push('Reserve price may be above estimated market value');
    recommendations.push('Verify market value independently before bidding');
  }
  if (discountPct >= 30) {
    recommendations.push('Excellent discount — strong investment opportunity');
  }

  // 2. Location Score (0-25 points)
  const tier = CITY_TIER[property.city] || CITY_TIER['default'];
  if (tier === 1) components.location = 25;
  else if (tier === 2) components.location = 18;
  else components.location = 10;

  // Location-based risks
  if (tier === 3) {
    risks.push('Tier 3 city — lower liquidity and appreciation potential');
  }

  // 3. Property Type Score (0-15 points)
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

  // 4. Size Score (0-10 points)
  if (property.areaSqft) {
    if (property.areaSqft >= 1500) components.size = 10;
    else if (property.areaSqft >= 1000) components.size = 8;
    else if (property.areaSqft >= 600) components.size = 6;
    else components.size = 3;
  } else {
    components.size = 5; // Unknown, neutral
    risks.push('Property area not specified — verify before bidding');
  }

  // 5. EMD Score (0-10 points) — lower EMD % is better
  const emdPct = property.emd && reservePrice > 0 ? (property.emd / reservePrice) * 100 : 10;
  if (emdPct <= 5) components.emd = 10;
  else if (emdPct <= 8) components.emd = 8;
  else if (emdPct <= 10) components.emd = 6;
  else components.emd = 3;

  if (emdPct > 10) {
    risks.push(`High EMD (${emdPct.toFixed(1)}% of reserve price) — significant capital locked`);
  }

  // 6. Bank Score (0-10 points)
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

  // Calculate overall score
  const overall = components.discount + components.location + components.propertyType +
                  components.size + components.emd + components.bank;

  // Grade
  let grade: DealScore['grade'];
  let label: string;
  if (overall >= 80) { grade = 'A'; label = 'Excellent Deal'; }
  else if (overall >= 65) { grade = 'B'; label = 'Good Deal'; }
  else if (overall >= 50) { grade = 'C'; label = 'Average Deal'; }
  else if (overall >= 35) { grade = 'D'; label = 'Below Average'; }
  else { grade = 'F'; label = 'Poor Deal'; }

  // ROI calculations
  const totalCost = reservePrice + (reservePrice * 0.07); // 7% for stamp duty, registration, legal
  const potentialProfit = estimatedMarketValue - totalCost;
  const profitMargin = totalCost > 0 ? (potentialProfit / totalCost) * 100 : 0;
  const rentalYield = (estimatedMarketValue * 0.03) / reservePrice * 100; // 3% rental yield
  const breakEvenYears = profitMargin > 0 ? Math.ceil(100 / profitMargin) : 99;

  // Add general recommendations
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