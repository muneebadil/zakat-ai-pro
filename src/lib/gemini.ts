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
const GOLDPRICE_API_URL = "https://data-asg.goldprice.org/dbXRates/PKR";

const CORS_PROXIES = [
  () => "https://corsproxy.io/?" + encodeURIComponent(GOLDPRICE_API_URL),
  () => "https://api.allorigins.win/raw?url=" + encodeURIComponent(GOLDPRICE_API_URL),
];

async function fetchFromGoldPriceOrg(): Promise<MetalPrices> {
  let lastError: Error | null = null;
  for (const getUrl of CORS_PROXIES) {
    try {
      const url = getUrl();
      const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
      if (!res.ok) continue;
      const raw = await res.text();
      const data = JSON.parse(raw) as { items?: Array<{ xauPrice?: number; xagPrice?: number }> };
      const item = data?.items?.[0];
      if (!item || item.xauPrice == null || item.xagPrice == null) continue;
      return {
        gold: item.xauPrice / TROY_OUNCE_IN_GRAMS,
        silver: item.xagPrice / TROY_OUNCE_IN_GRAMS,
      };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastError ?? new Error("goldprice.org API failed");
}

export async function fetchMetalPrices(): Promise<MetalPrices> {
  const prices = await fetchFromGoldPriceOrg();
  if (prices.gold > 0 && prices.silver > 0) {
    return prices;
  }
  throw new Error("Invalid metal price data");
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
