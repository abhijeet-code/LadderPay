export type InvoiceStatus =
  | "DRAFT"
  | "GST_VERIFIED"
  | "LADDER_CONFIGURED"
  | "COLLATERAL_POSTED"
  | "FUNDING_OPEN"
  | "FULLY_FUNDED"
  | "DISBURSED"
  | "MATURED"
  | "SETTLED"
  | "DEFAULTED";

export interface TrancheTier {
  tierIndex: number;
  name: string;
  sharePercent: number;
  principalINR: number;
  collateralRequiredINR: number;
  collateralRatioPercent: number;
  annualRatePercent: number;
  cost90DaysINR: number;
  fundedAmountINR: number;
  isUnlocked: boolean;
  riskDescription: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  msmeName: string;
  msmeGstin: string;
  msmeVpa: string;
  buyerName: string;
  buyerPan: string;
  buyerVpa: string;
  faceValueINR: number;
  tenureDays: number;
  reserveINR: number;
  status: InvoiceStatus;
  tranches: TrancheTier[];
  collateralDepositedINR: number;
  totalAdvanceINR: number;
  totalDiscountINR: number;
  netDisbursalINR: number;
  payoutUtr?: string;
  reputationLevel: number;
  tier0CapINR: number;
  nftTokenId?: string;
  txHash?: string;
  createdAt: string;
}

export interface DrunixEvent {
  id: string;
  timestamp: string;
  sagaName: string;
  step: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  idempotencyKey: string;
  details: string;
  txHash?: string;
}

export interface WaterfallResult {
  invoiceId: string;
  buyerPaidINR: number;
  tier3PaidINR: number;
  tier2PaidINR: number;
  tier1PaidINR: number;
  tier0PaidINR: number;
  reservePaidINR: number;
  collateralReturnedINR: number;
  collateralLiquidatedINR: number;
  isDefault: boolean;
  newReputationLevel: number;
}
