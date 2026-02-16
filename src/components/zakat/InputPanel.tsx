import GlassInput from "./GlassInput";
import type { ZakatInputs, BusinessInputs } from "@/lib/zakat";
import { formatCurrency } from "@/lib/zakat";
import { Loader2, RotateCcw } from "lucide-react";

interface InputPanelProps {
  mode: "personal" | "business";
  setMode: (m: "personal" | "business") => void;
  personalInputs: ZakatInputs;
  businessInputs: BusinessInputs;
  updatePersonal: (key: keyof ZakatInputs, value: number) => void;
  updateBusiness: (key: keyof BusinessInputs, value: number) => void;
  nisabBasis: "gold" | "silver";
  setNisabBasis: (b: "gold" | "silver") => void;
  goldPrice: number;
  silverPrice: number;
  pricesLoading: boolean;
  onCalculate: () => void;
  onReset: () => void;
  calculating: boolean;
}

const InputPanel = ({
  mode,
  setMode,
  personalInputs,
  businessInputs,
  updatePersonal,
  updateBusiness,
  nisabBasis,
  setNisabBasis,
  goldPrice,
  silverPrice,
  pricesLoading,
  onCalculate,
  onReset,
  calculating,
}: InputPanelProps) => {
  return (
    <div className="glass-card-glow p-6 sm:p-8 space-y-6">
      <h2 className="text-xl font-bold text-foreground">Zakat Inputs</h2>

      {/* Mode Toggle */}
      <div className="flex rounded-xl bg-secondary/50 p-1">
        {(["personal", "business"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
              mode === m
                ? "bg-primary/20 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "personal" ? "Personal Mode" : "Business Mode"}
          </button>
        ))}
      </div>

      {mode === "personal" ? (
        <div className="space-y-6">
          {/* Cash */}
          <div>
            <p className="section-label">💰 Cash</p>
            <div className="grid gap-3">
              <GlassInput label="Cash at Home" value={personalInputs.cashAtHome} onChange={(v) => updatePersonal("cashAtHome", v)} suffix="PKR" />
              <GlassInput label="Bank Balance" value={personalInputs.bankBalance} onChange={(v) => updatePersonal("bankBalance", v)} suffix="PKR" />
              <GlassInput label="Digital Wallets" value={personalInputs.digitalWallets} onChange={(v) => updatePersonal("digitalWallets", v)} suffix="PKR" />
            </div>
          </div>

          {/* Gold */}
          <div>
            <p className="section-label">🥇 Gold</p>
            <GlassInput
              label="Gold Weight"
              value={personalInputs.goldGrams}
              onChange={(v) => updatePersonal("goldGrams", v)}
              suffix="grams"
              info={pricesLoading ? "Fetching price..." : goldPrice > 0 ? `Current price: ${formatCurrency(goldPrice)}/gram` : "Price unavailable"}
            />
          </div>

          {/* Silver */}
          <div>
            <p className="section-label">🥈 Silver</p>
            <GlassInput
              label="Silver Weight"
              value={personalInputs.silverGrams}
              onChange={(v) => updatePersonal("silverGrams", v)}
              suffix="grams"
              info={pricesLoading ? "Fetching price..." : silverPrice > 0 ? `Current price: ${formatCurrency(silverPrice)}/gram` : "Price unavailable"}
            />
          </div>

          {/* Investments */}
          <div>
            <p className="section-label">📈 Investments</p>
            <div className="grid gap-3">
              <GlassInput label="Stocks" value={personalInputs.stocks} onChange={(v) => updatePersonal("stocks", v)} suffix="PKR" />
              <GlassInput label="Mutual Funds" value={personalInputs.mutualFunds} onChange={(v) => updatePersonal("mutualFunds", v)} suffix="PKR" />
              <GlassInput label="Crypto" value={personalInputs.crypto} onChange={(v) => updatePersonal("crypto", v)} suffix="PKR" />
              <GlassInput label="Other Investments" value={personalInputs.otherInvestments} onChange={(v) => updatePersonal("otherInvestments", v)} suffix="PKR" />
            </div>
          </div>

          {/* Receivables */}
          <div>
            <p className="section-label">📥 Receivables</p>
            <GlassInput label="Money You Will Receive" value={personalInputs.receivables} onChange={(v) => updatePersonal("receivables", v)} suffix="PKR" />
          </div>

          {/* Liabilities */}
          <div>
            <p className="section-label">📤 Liabilities</p>
            <div className="grid gap-3">
              <GlassInput label="Short Term Loans" value={personalInputs.shortTermLoans} onChange={(v) => updatePersonal("shortTermLoans", v)} suffix="PKR" />
              <GlassInput label="Credit Card Dues" value={personalInputs.creditCardDues} onChange={(v) => updatePersonal("creditCardDues", v)} suffix="PKR" />
              <GlassInput label="Other Payables" value={personalInputs.otherPayables} onChange={(v) => updatePersonal("otherPayables", v)} suffix="PKR" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground italic">
              Only short-term liabilities are deductible in Zakat calculation.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="section-label">🏢 Business Assets</p>
            <div className="grid gap-3">
              <GlassInput label="Inventory Value" value={businessInputs.inventoryValue} onChange={(v) => updateBusiness("inventoryValue", v)} suffix="PKR" />
              <GlassInput label="Business Cash" value={businessInputs.businessCash} onChange={(v) => updateBusiness("businessCash", v)} suffix="PKR" />
              <GlassInput label="Business Bank Account" value={businessInputs.businessBank} onChange={(v) => updateBusiness("businessBank", v)} suffix="PKR" />
              <GlassInput label="Receivables" value={businessInputs.receivables} onChange={(v) => updateBusiness("receivables", v)} suffix="PKR" />
            </div>
          </div>
          <div>
            <p className="section-label">📤 Business Liabilities</p>
            <div className="grid gap-3">
              <GlassInput label="Supplier Payables" value={businessInputs.supplierPayables} onChange={(v) => updateBusiness("supplierPayables", v)} suffix="PKR" />
              <GlassInput label="Short Term Business Loans" value={businessInputs.shortTermLoans} onChange={(v) => updateBusiness("shortTermLoans", v)} suffix="PKR" />
            </div>
          </div>
        </div>
      )}

      {/* Nisab Basis */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground/80">Nisab Basis</label>
        <select
          value={nisabBasis}
          onChange={(e) => setNisabBasis(e.target.value as "gold" | "silver")}
          className="glass-input cursor-pointer"
        >
          <option value="silver">Silver Basis (Recommended)</option>
          <option value="gold">Gold Basis</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCalculate}
          disabled={calculating || pricesLoading}
          className="btn-gradient flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {calculating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Calculating...
            </>
          ) : (
            "Calculate Zakat"
          )}
        </button>
        <button
          onClick={onReset}
          className="rounded-xl border border-border/50 bg-secondary/30 px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default InputPanel;
