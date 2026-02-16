import AnimatedNumber from "./AnimatedNumber";
import { formatCurrency, type ZakatResult } from "@/lib/zakat";

interface ResultPanelProps {
  result: ZakatResult | null;
  nisabBasis: "gold" | "silver";
}

const Row = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{formatCurrency(value)}</span>
  </div>
);

const ResultPanel = ({ result, nisabBasis }: ResultPanelProps) => {
  if (!result) {
    return (
      <div className="glass-card p-6 sm:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="text-4xl">🕌</div>
          <p className="text-muted-foreground text-sm">
            Fill in your assets and click Calculate to see your Zakat breakdown.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card-glow p-6 sm:p-8 space-y-6 animate-glow-pulse">
      <h2 className="text-xl font-bold text-foreground">Zakat Summary</h2>

      {/* Breakdown */}
      <div className="space-y-0">
        <Row label="Total Assets" value={result.totalAssets} />
        <Row label="Total Liabilities" value={result.totalLiabilities} />
        <div className="flex items-center justify-between py-2.5 border-b border-border/30">
          <span className="text-sm font-semibold text-foreground">Net Zakatable Wealth</span>
          <span className="text-sm font-bold text-foreground">{formatCurrency(result.netWealth)}</span>
        </div>
      </div>

      {/* Nisab Values */}
      <div className="rounded-xl bg-secondary/30 p-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nisab Thresholds</p>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Gold Nisab (87.48g)</span>
          <span className="text-foreground">{formatCurrency(result.goldNisab)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Silver Nisab (612.36g)</span>
          <span className="text-foreground">{formatCurrency(result.silverNisab)}</span>
        </div>
        <div className="flex justify-between text-sm pt-1 border-t border-border/30">
          <span className="text-muted-foreground">Selected ({nisabBasis})</span>
          <span className="font-semibold text-primary">{formatCurrency(result.selectedNisab)}</span>
        </div>
      </div>

      {/* Zakat Result */}
      {result.isBelowNisab ? (
        <div className="rounded-2xl bg-secondary/40 border border-border/30 p-6 text-center space-y-2">
          <p className="text-lg font-semibold text-foreground">Below Nisab</p>
          <p className="text-sm text-muted-foreground">
            You are below Nisab. Zakat is not obligatory.
          </p>
        </div>
      ) : (
        <div className="zakat-highlight space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Your Zakat Payable
          </p>
          <AnimatedNumber
            value={result.zakatPayable}
            className="text-3xl sm:text-4xl font-extrabold text-gradient block"
            duration={1200}
          />
          <p className="text-xs text-muted-foreground">
            Net Wealth × 2.5%
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultPanel;
