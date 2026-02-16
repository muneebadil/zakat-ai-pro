import { useState, useEffect, useCallback } from "react";
import HeroSection from "@/components/zakat/HeroSection";
import InputPanel from "@/components/zakat/InputPanel";
import ResultPanel from "@/components/zakat/ResultPanel";
import AIExplanation from "@/components/zakat/AIExplanation";
import {
  calculatePersonalZakat,
  calculateBusinessZakat,
  type ZakatInputs,
  type BusinessInputs,
  type ZakatResult,
} from "@/lib/zakat";
import { fetchMetalPrices, fetchZakatExplanation } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";

const defaultPersonal: ZakatInputs = {
  cashAtHome: 0, bankBalance: 0, digitalWallets: 0,
  goldGrams: 0, silverGrams: 0,
  stocks: 0, mutualFunds: 0, crypto: 0, otherInvestments: 0,
  receivables: 0,
  shortTermLoans: 0, creditCardDues: 0, otherPayables: 0,
};

const defaultBusiness: BusinessInputs = {
  inventoryValue: 0, businessCash: 0, businessBank: 0,
  receivables: 0, supplierPayables: 0, shortTermLoans: 0,
};

const Index = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<"personal" | "business">("personal");
  const [personalInputs, setPersonalInputs] = useState<ZakatInputs>(defaultPersonal);
  const [businessInputs, setBusinessInputs] = useState<BusinessInputs>(defaultBusiness);
  const [nisabBasis, setNisabBasis] = useState<"gold" | "silver">("silver");
  const [goldPrice, setGoldPrice] = useState(0);
  const [silverPrice, setSilverPrice] = useState(0);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [result, setResult] = useState<ZakatResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [explanationLoading, setExplanationLoading] = useState(false);

  // Fetch metal prices on mount
  useEffect(() => {
    setPricesLoading(true);
    fetchMetalPrices()
      .then(({ gold, silver }) => {
        setGoldPrice(gold);
        setSilverPrice(silver);
      })
      .catch(() => {
        toast({
          title: "Price Fetch Failed",
          description: "Could not fetch metal prices. Please enter manually.",
          variant: "destructive",
        });
      })
      .finally(() => setPricesLoading(false));
  }, []);

  const updatePersonal = useCallback((key: keyof ZakatInputs, value: number) => {
    setPersonalInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateBusiness = useCallback((key: keyof BusinessInputs, value: number) => {
    setBusinessInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleCalculate = useCallback(() => {
    if (goldPrice === 0 && silverPrice === 0 && !pricesLoading) {
      toast({
        title: "Metal Prices Required",
        description: "Please wait for prices to load or enter gold/silver values.",
        variant: "destructive",
      });
      return;
    }

    setCalculating(true);
    setExplanation("");

    setTimeout(() => {
      const res =
        mode === "personal"
          ? calculatePersonalZakat(personalInputs, goldPrice, silverPrice, nisabBasis)
          : calculateBusinessZakat(businessInputs, goldPrice, silverPrice, nisabBasis);
      setResult(res);
      setCalculating(false);
    }, 400);
  }, [mode, personalInputs, businessInputs, goldPrice, silverPrice, nisabBasis, pricesLoading, toast]);

  const handleReset = useCallback(() => {
    setPersonalInputs(defaultPersonal);
    setBusinessInputs(defaultBusiness);
    setResult(null);
    setExplanation("");
  }, []);

  const handleFetchExplanation = useCallback(async () => {
    if (!result) return;
    setExplanationLoading(true);
    try {
      const text = await fetchZakatExplanation(
        result.totalAssets,
        result.totalLiabilities,
        result.netWealth,
        result.zakatPayable,
        nisabBasis,
        result.selectedNisab
      );
      setExplanation(text);
    } catch {
      toast({
        title: "AI Error",
        description: "Could not generate explanation.",
        variant: "destructive",
      });
    } finally {
      setExplanationLoading(false);
    }
  }, [result, nisabBasis, toast]);

  return (
    <div className="min-h-screen bg-background bg-radial-grid">
      <HeroSection />

      <section id="calculator" className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <InputPanel
            mode={mode}
            setMode={setMode}
            personalInputs={personalInputs}
            businessInputs={businessInputs}
            updatePersonal={updatePersonal}
            updateBusiness={updateBusiness}
            nisabBasis={nisabBasis}
            setNisabBasis={setNisabBasis}
            goldPrice={goldPrice}
            silverPrice={silverPrice}
            pricesLoading={pricesLoading}
            onCalculate={handleCalculate}
            onReset={handleReset}
            calculating={calculating}
            onGoldPriceChange={setGoldPrice}
            onSilverPriceChange={setSilverPrice}
          />

          <div className="space-y-6 lg:sticky lg:top-8">
            <ResultPanel result={result} nisabBasis={nisabBasis} />
            <AIExplanation
              explanation={explanation}
              loading={explanationLoading}
              onFetch={handleFetchExplanation}
              hasResult={!!result}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
