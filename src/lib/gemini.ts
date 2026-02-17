const GEMINI_API_KEY = "AIzaSyDAfGuQGzef64xZP4YHJbRqDzD_dJqt7Lo";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export interface MetalPrices {
  gold: number;
  silver: number;
}

const TROY_OUNCE_IN_GRAMS = 31.1035;

async function fetchFromGoldPriceOrg(): Promise<MetalPrices> {
  const res = await fetch("https://data-asg.goldprice.org/dbXRates/PKR");
  if (!res.ok) throw new Error("goldprice.org API failed");

  const data = await res.json();
  const item = data?.items?.[0];
  if (!item || !item.xauPrice || !item.xagPrice) {
    throw new Error("Invalid metal price data");
  }

  return {
    gold: item.xauPrice / TROY_OUNCE_IN_GRAMS,
    silver: item.xagPrice / TROY_OUNCE_IN_GRAMS,
  };
}

async function fetchFromExchangeRate(): Promise<MetalPrices> {
  const rateRes = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
  if (!rateRes.ok) throw new Error("Exchange rate API failed");
  const rateData = await rateRes.json();
  const pkrRate = rateData.rates?.PKR;
  if (!pkrRate) throw new Error("PKR rate not found");

  // Approximate international spot prices per gram in USD
  const goldUsdPerGram = 88;
  const silverUsdPerGram = 1.05;

  return {
    gold: Math.round(goldUsdPerGram * pkrRate),
    silver: Math.round(silverUsdPerGram * pkrRate),
  };
}

export async function fetchMetalPrices(): Promise<MetalPrices> {
  // Strategy 1: goldprice.org (most accurate, per troy ounce in PKR)
  try {
    const prices = await fetchFromGoldPriceOrg();
    if (prices.gold > 0 && prices.silver > 0) {
      console.log("✅ Prices loaded from goldprice.org", prices);
      return prices;
    }
  } catch (e) {
    console.warn("goldprice.org failed, trying fallback...", e);
  }

  // Strategy 2: Exchange rate API + approximate spot prices
  try {
    const prices = await fetchFromExchangeRate();
    if (prices.gold > 0 && prices.silver > 0) {
      console.log("✅ Prices loaded from exchange rate fallback", prices);
      return prices;
    }
  } catch (e) {
    console.warn("Exchange rate fallback also failed", e);
  }

  // Strategy 3: Hardcoded fallback (approximate PKR per gram)
  console.warn("Using hardcoded fallback prices");
  return { gold: 43670, silver: 652 };
}

export async function fetchZakatExplanation(
  totalAssets: number,
  totalLiabilities: number,
  netWealth: number,
  zakatPayable: number,
  nisabBasis: string,
  selectedNisab: number
): Promise<string> {
  const prompt = `Explain in simple Islamic finance terms how zakat was calculated with these values:
Total Assets: PKR ${totalAssets.toLocaleString()}
Total Liabilities: PKR ${totalLiabilities.toLocaleString()}
Net Zakatable Wealth: PKR ${netWealth.toLocaleString()}
Nisab Basis: ${nisabBasis} (PKR ${selectedNisab.toLocaleString()})
Zakat Payable: PKR ${zakatPayable.toLocaleString()}

Keep it concise (3-4 sentences), clear, and mention the 2.5% rate and nisab threshold.`;

  return callGemini(prompt);
}
