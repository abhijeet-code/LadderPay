import { InvoiceRecord, DrunixEvent, TrancheTier } from "./types";

const INITIAL_TRANCHES: TrancheTier[] = [
  {
    tierIndex: 0,
    name: "Tier 0 (Uncollateralized)",
    sharePercent: 20,
    principalINR: 100000,
    collateralRequiredINR: 0,
    collateralRatioPercent: 0,
    annualRatePercent: 18,
    cost90DaysINR: 4500,
    fundedAmountINR: 0,
    isUnlocked: true,
    riskDescription: "Highest Yield (18%), First-Loss Absorption, Collateral-Free (Capped)",
  },
  {
    tierIndex: 1,
    name: "Tier 1 (25% Collateral)",
    sharePercent: 30,
    principalINR: 150000,
    collateralRequiredINR: 37500,
    collateralRatioPercent: 25,
    annualRatePercent: 14,
    cost90DaysINR: 5250,
    fundedAmountINR: 0,
    isUnlocked: false,
    riskDescription: "Moderate Risk (14%), 25% Margin Backing",
  },
  {
    tierIndex: 2,
    name: "Tier 2 (50% Collateral)",
    sharePercent: 30,
    principalINR: 150000,
    collateralRequiredINR: 75000,
    collateralRatioPercent: 50,
    annualRatePercent: 11,
    cost90DaysINR: 4125,
    fundedAmountINR: 0,
    isUnlocked: false,
    riskDescription: "Low Risk (11%), 50% Margin Backing",
  },
  {
    tierIndex: 3,
    name: "Tier 3 (100% Collateral)",
    sharePercent: 10,
    principalINR: 50000,
    collateralRequiredINR: 50000,
    collateralRatioPercent: 100,
    annualRatePercent: 9,
    cost90DaysINR: 1125,
    fundedAmountINR: 0,
    isUnlocked: false,
    riskDescription: "Safest Slice (9%), 100% Collateral Protected, Repaid First",
  },
];

export const INITIAL_INVOICE: InvoiceRecord = {
  id: "",
  invoiceNumber: "",
  msmeName: "",
  msmeGstin: "",
  msmeVpa: "",
  buyerName: "",
  buyerPan: "",
  buyerVpa: "",
  faceValueINR: 0,
  tenureDays: 90,
  reserveINR: 0,
  status: "DRAFT",
  tranches: INITIAL_TRANCHES,
  collateralDepositedINR: 0,
  totalAdvanceINR: 0,
  totalDiscountINR: 0,
  netDisbursalINR: 0,
  reputationLevel: 1,
  tier0CapINR: 100000,
  createdAt: "",
};

export const INITIAL_DRUNIX_EVENTS: DrunixEvent[] = [];

/**
 * Creates a fully configured invoice record after GST verification.
 * This is the function called by the upload form to produce the demo Ramesh invoice.
 */
export function createVerifiedInvoice(form: {
  invoiceNumber: string;
  msmeGstin: string;
  buyerPan: string;
  faceValueINR: number;
  tenureDays: number;
}): InvoiceRecord {
  const fv = form.faceValueINR;
  const tenure = form.tenureDays;

  // Tier 0 cap = min(20% of invoice, MSME ladder level cap, buyer exposure)
  // For demo: ladder level 1 = ₹1,00,000 and buyer exposure = ₹5L
  const tier0Cap = Math.min(fv * 0.2, 100000);

  const tranches: TrancheTier[] = [
    {
      tierIndex: 0,
      name: "Tier 0 (Uncollateralized)",
      sharePercent: 20,
      principalINR: tier0Cap,
      collateralRequiredINR: 0,
      collateralRatioPercent: 0,
      annualRatePercent: 18,
      cost90DaysINR: Math.round((tier0Cap * 0.18 * tenure) / 365),
      fundedAmountINR: 0,
      isUnlocked: true,
      riskDescription: "Highest Yield (18%), First-Loss Absorption, Collateral-Free (Capped)",
    },
    {
      tierIndex: 1,
      name: "Tier 1 (25% Collateral)",
      sharePercent: 30,
      principalINR: fv * 0.3,
      collateralRequiredINR: fv * 0.3 * 0.25,
      collateralRatioPercent: 25,
      annualRatePercent: 14,
      cost90DaysINR: Math.round((fv * 0.3 * 0.14 * tenure) / 365),
      fundedAmountINR: 0,
      isUnlocked: false,
      riskDescription: "Moderate Risk (14%), 25% Margin Backing",
    },
    {
      tierIndex: 2,
      name: "Tier 2 (50% Collateral)",
      sharePercent: 30,
      principalINR: fv * 0.3,
      collateralRequiredINR: fv * 0.3 * 0.5,
      collateralRatioPercent: 50,
      annualRatePercent: 11,
      cost90DaysINR: Math.round((fv * 0.3 * 0.11 * tenure) / 365),
      fundedAmountINR: 0,
      isUnlocked: false,
      riskDescription: "Low Risk (11%), 50% Margin Backing",
    },
    {
      tierIndex: 3,
      name: "Tier 3 (100% Collateral)",
      sharePercent: 10,
      principalINR: fv * 0.1,
      collateralRequiredINR: fv * 0.1,
      collateralRatioPercent: 100,
      annualRatePercent: 9,
      cost90DaysINR: Math.round((fv * 0.1 * 0.09 * tenure) / 365),
      fundedAmountINR: 0,
      isUnlocked: false,
      riskDescription: "Safest Slice (9%), 100% Collateral Protected, Repaid First",
    },
  ];

  return {
    id: `INV-${Date.now().toString(36).toUpperCase()}`,
    invoiceNumber: form.invoiceNumber,
    msmeName: "Ramesh Steel Products Pvt Ltd",
    msmeGstin: form.msmeGstin,
    msmeVpa: "ramesh.steel@okhdfcbank",
    buyerName: "Tata Motors Commercial Fleet Ltd",
    buyerPan: form.buyerPan,
    buyerVpa: "tata.corp@icici",
    faceValueINR: fv,
    tenureDays: tenure,
    reserveINR: fv * 0.1,
    status: "GST_VERIFIED",
    tranches,
    collateralDepositedINR: 0,
    totalAdvanceINR: 0,
    totalDiscountINR: 0,
    netDisbursalINR: 0,
    reputationLevel: 1,
    tier0CapINR: tier0Cap,
    createdAt: new Date().toISOString(),
  };
}
