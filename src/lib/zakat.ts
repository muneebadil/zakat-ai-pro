export interface ZakatInputs {
  // Cash
  cashAtHome: number;
  bankBalance: number;
  digitalWallets: number;
  // Gold & Silver
  goldGrams: number;
  silverGrams: number;
  // Investments
  stocks: number;
  mutualFunds: number;
  crypto: number;
  otherInvestments: number;
  // Receivables
  receivables: number;
  // Liabilities
  shortTermLoans: number;
  creditCardDues: number;
  otherPayables: number;
}

export interface BusinessInputs {
  inventoryValue: number;
  businessCash: number;
  businessBank: number;
  receivables: number;
  supplierPayables: number;
  shortTermLoans: number;
}

export interface ZakatResult {
  totalAssets: number;
  totalLiabilities: number;
  netWealth: number;
  goldNisab: number;
  silverNisab: number;
  selectedNisab: number;
  zakatPayable: number;
  isBelowNisab: boolean;
  goldValue: number;
  silverValue: number;
}

export const GOLD_NISAB_GRAMS = 87.48;
export const SILVER_NISAB_GRAMS = 612.36;
export const ZAKAT_RATE = 0.025;

export function calculatePersonalZakat(
  inputs: ZakatInputs,
  goldPrice: number,
  silverPrice: number,
  nisabBasis: "gold" | "silver"
): ZakatResult {
  const goldValue = inputs.goldGrams * goldPrice;
  const silverValue = inputs.silverGrams * silverPrice;

  const totalAssets =
    inputs.cashAtHome +
    inputs.bankBalance +
    inputs.digitalWallets +
    goldValue +
    silverValue +
    inputs.stocks +
    inputs.mutualFunds +
    inputs.crypto +
    inputs.otherInvestments +
    inputs.receivables;

  const totalLiabilities =
    inputs.shortTermLoans + inputs.creditCardDues + inputs.otherPayables;

  const netWealth = totalAssets - totalLiabilities;
  const goldNisab = GOLD_NISAB_GRAMS * goldPrice;
  const silverNisab = SILVER_NISAB_GRAMS * silverPrice;
  const selectedNisab = nisabBasis === "gold" ? goldNisab : silverNisab;
  const isBelowNisab = netWealth < selectedNisab;
  const zakatPayable = isBelowNisab ? 0 : netWealth * ZAKAT_RATE;

  return {
    totalAssets,
    totalLiabilities,
    netWealth,
    goldNisab,
    silverNisab,
    selectedNisab,
    zakatPayable,
    isBelowNisab,
    goldValue,
    silverValue,
  };
}

export function calculateBusinessZakat(
  inputs: BusinessInputs,
  goldPrice: number,
  silverPrice: number,
  nisabBasis: "gold" | "silver"
): ZakatResult {
  const totalAssets =
    inputs.inventoryValue +
    inputs.businessCash +
    inputs.businessBank +
    inputs.receivables;

  const totalLiabilities = inputs.supplierPayables + inputs.shortTermLoans;

  const netWealth = totalAssets - totalLiabilities;
  const goldNisab = GOLD_NISAB_GRAMS * goldPrice;
  const silverNisab = SILVER_NISAB_GRAMS * silverPrice;
  const selectedNisab = nisabBasis === "gold" ? goldNisab : silverNisab;
  const isBelowNisab = netWealth < selectedNisab;
  const zakatPayable = isBelowNisab ? 0 : netWealth * ZAKAT_RATE;

  return {
    totalAssets,
    totalLiabilities,
    netWealth,
    goldNisab,
    silverNisab,
    selectedNisab,
    zakatPayable,
    isBelowNisab,
    goldValue: 0,
    silverValue: 0,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
