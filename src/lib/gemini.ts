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

function parseNumeric(text: string): number {
  const cleaned = text.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export interface MetalPrices {
  gold: number;
  silver: number;
}

// Default fallback prices (approximate PKR per gram, updated periodically)
const FALLBACK_GOLD_PRICE = 28000;
const FALLBACK_SILVER_PRICE = 330;

async function fetchFromFreeApi(): Promise<MetalPrices> {
  // Use frankfurter + gold spot approach: fetch USD/PKR rate, then convert from international gold/silver prices
  // Gold: ~$85/gram, Silver: ~$1/gram (approximate international prices)
  
  // Try fetching live PKR exchange rate
  const rateRes = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
  if (!rateRes.ok) throw new Error("Exchange rate API failed");
  const rateData = await rateRes.json();
  const pkrRate = rateData.rates?.PKR;
  if (!pkrRate) throw new Error("PKR rate not found");

  // International approximate spot prices per gram in USD
  // Gold: ~$85-90/gram, Silver: ~$1.0-1.1/gram  
  // These are rough estimates; the exchange rate conversion gives a reasonable PKR value
  const goldUsdPerGram = 88;
  const silverUsdPerGram = 1.05;

  return {
    gold: Math.round(goldUsdPerGram * pkrRate),
    silver: Math.round(silverUsdPerGram * pkrRate),
  };
}

export async function fetchMetalPrices(): Promise<MetalPrices> {
  // Strategy 1: Try free exchange rate API + international spot prices
  try {
    const prices = await fetchFromFreeApi();
    if (prices.gold > 0 && prices.silver > 0) {
      return prices;
    }
  } catch (e) {
    console.warn("Free API failed, trying Gemini...", e);
  }

  // Strategy 2: Try Gemini as backup
  try {
    const [goldResponse, silverResponse] = await Promise.all([
      callGemini(
        "Provide current gold price per gram in Pakistani Rupees (PKR) as a numeric value only. No text, no currency symbol, just the number."
      ),
      callGemini(
        "Provide current silver price per gram in Pakistani Rupees (PKR) as a numeric value only. No text, no currency symbol, just the number."
      ),
    ]);

    const gold = parseNumeric(goldResponse);
    const silver = parseNumeric(silverResponse);

    if (gold > 0 && silver > 0) {
      return { gold, silver };
    }
  } catch (e) {
    console.warn("Gemini API failed too:", e);
  }

  // Strategy 3: Return fallback defaults
  console.warn("Using fallback metal prices");
  return { gold: FALLBACK_GOLD_PRICE, silver: FALLBACK_SILVER_PRICE };
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
