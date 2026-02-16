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

export async function fetchMetalPrices(): Promise<MetalPrices> {
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

    if (gold === 0 || silver === 0) {
      throw new Error("Failed to parse metal prices");
    }

    return { gold, silver };
  } catch (error) {
    console.error("Failed to fetch metal prices:", error);
    throw error;
  }
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
