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

export async function fetchMetalPrices(): Promise<MetalPrices> {
  const res = await fetch("https://data-asg.goldprice.org/dbXRates/PKR");
  if (!res.ok) throw new Error("Metal price API failed");

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
