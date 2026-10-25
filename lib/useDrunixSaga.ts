import { useState, useCallback, useRef } from "react";
import { DrunixEvent } from "./types";

export interface SagaStep {
  sagaName: string;
  step: string;
  details: string;
  delayMs: number;
  hasTxHash?: boolean;
  /** If set, simulates a failure then retry for this step */
  simulateRetry?: boolean;
}

/**
 * useDrunixSaga — A React hook that emits realistic Drunix orchestration events
 * with configurable timing, retry simulation, and idempotency key tracking.
 *
 * Usage:
 *   const { runSaga, isRunning } = useDrunixSaga(setDrunixEvents);
 *   await runSaga(COLLATERAL_LOCK_STEPS);
 */
export function useDrunixSaga(
  setEvents: React.Dispatch<React.SetStateAction<DrunixEvent[]>>
) {
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef(false);

  const emitEvent = useCallback(
    (evt: DrunixEvent) => {
      setEvents((prev) => [evt, ...prev]);
    },
    [setEvents]
  );

  const runSaga = useCallback(
    async (steps: SagaStep[]) => {
      setIsRunning(true);
      abortRef.current = false;

      for (const s of steps) {
        if (abortRef.current) break;

        const idempotencyKey = `idemp-${s.step.toLowerCase()}-${Date.now().toString(36)}`;
        const txHash = s.hasTxHash
          ? "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
          : undefined;

        // If retry simulation is enabled, emit a FAILED event first
        if (s.simulateRetry) {
          emitEvent({
            id: `evt-${Date.now()}-fail`,
            timestamp: new Date().toLocaleTimeString(),
            sagaName: s.sagaName,
            step: s.step,
            status: "FAILED",
            idempotencyKey,
            details: `[Attempt 1] ${s.details} — RPC timeout, scheduling retry...`,
            txHash: undefined,
          });
          await delay(800);

          if (abortRef.current) break;

          emitEvent({
            id: `evt-${Date.now()}-retry`,
            timestamp: new Date().toLocaleTimeString(),
            sagaName: s.sagaName,
            step: s.step + "_RETRY",
            status: "PENDING",
            idempotencyKey,
            details: `[Attempt 2] Retrying with same idempotency key ${idempotencyKey}...`,
            txHash: undefined,
          });
          await delay(600);

          if (abortRef.current) break;
        }

        // Emit PENDING
        emitEvent({
          id: `evt-${Date.now()}-pending`,
          timestamp: new Date().toLocaleTimeString(),
          sagaName: s.sagaName,
          step: s.step,
          status: "PENDING",
          idempotencyKey,
          details: `Executing: ${s.details}`,
          txHash: undefined,
        });

        await delay(s.delayMs);
        if (abortRef.current) break;

        // Emit SUCCESS
        emitEvent({
          id: `evt-${Date.now()}-success`,
          timestamp: new Date().toLocaleTimeString(),
          sagaName: s.sagaName,
          step: s.step,
          status: "SUCCESS",
          idempotencyKey,
          details: s.details,
          txHash,
        });

        await delay(200); // Small gap between steps for visual clarity
      }

      setIsRunning(false);
    },
    [emitEvent]
  );

  const abort = useCallback(() => {
    abortRef.current = true;
    setIsRunning(false);
  }, []);

  return { runSaga, isRunning, abort };
}

// Pre-defined saga step sequences for the demo flow

export const INVOICE_VERIFY_STEPS: SagaStep[] = [
  {
    sagaName: "InvoiceIngestionSaga",
    step: "GSTN_IRN_VALIDATION",
    details: "GST E-Invoice verified against NIC portal. IRN cryptographically signed.",
    delayMs: 700,
    hasTxHash: false,
  },
  {
    sagaName: "RiskPricingSaga",
    step: "TIER_LADDER_COMPUTE",
    details: "Computed Tier 0 Cap = ₹1,00,000 based on Reputation Level 1 and buyer exposure.",
    delayMs: 500,
  },
  {
    sagaName: "TokenizationSaga",
    step: "MINT_ERC721_AND_ERC1155",
    details: "Minted Invoice NFT (ERC-721) & 4 Tranche Tokens (ERC-1155) on Polygon Amoy.",
    delayMs: 900,
    hasTxHash: true,
  },
];

export const COLLATERAL_LOCK_STEPS: SagaStep[] = [
  {
    sagaName: "CollateralLockSaga",
    step: "VALIDATE_MARGIN_AMOUNT",
    details: "Validated MSME margin deposit meets minimum collateral ratios for selected tiers.",
    delayMs: 400,
  },
  {
    sagaName: "CollateralLockSaga",
    step: "VAULT_LOCK_MARGIN",
    details: "Locked ₹1,12,500 margin into CollateralVault.sol. Tiers 1 & 2 unlocked.",
    delayMs: 800,
    hasTxHash: true,
    simulateRetry: true, // Demo: show a retry for the judges!
  },
  {
    sagaName: "CollateralLockSaga",
    step: "TIER_UNLOCK_CONFIRMED",
    details: "Tier 1 (25% margin) and Tier 2 (50% margin) activated for investor funding.",
    delayMs: 300,
    hasTxHash: true,
  },
];

export const FUNDING_COMPLETE_STEPS: SagaStep[] = [
  {
    sagaName: "TrancheFundingSaga",
    step: "TRANCHES_FULLY_SUBSCRIBED",
    details: "All selected tranches fully funded by investors. Total: ₹4,50,000.",
    delayMs: 500,
  },
];

export const DISBURSAL_STEPS: SagaStep[] = [
  {
    sagaName: "DisbursalSaga",
    step: "UPI_PAYOUT_PREPARE",
    details: "Preparing NPCI UPI P2M payout to ramesh.steel@okhdfcbank.",
    delayMs: 400,
  },
  {
    sagaName: "DisbursalSaga",
    step: "UPI_PAYOUT_TRIGGER",
    details: "Instant NPCI UPI Payout ₹4,35,000 credited. UTR generated.",
    delayMs: 700,
    hasTxHash: false,
  },
  {
    sagaName: "DisbursalSaga",
    step: "INVOICE_STATUS_ACTIVE",
    details: "Invoice status updated to ACTIVE_DISBURSED on-chain.",
    delayMs: 500,
    hasTxHash: true,
  },
];

export const WATERFALL_STEPS: SagaStep[] = [
  {
    sagaName: "WaterfallSettlementSaga",
    step: "BUYER_PAYMENT_RECEIVED",
    details: "NPCI UPI Collection webhook received. ₹5,00,000 from tata.corp@icici.",
    delayMs: 500,
  },
  {
    sagaName: "WaterfallSettlementSaga",
    step: "WATERFALL_EXECUTION",
    details: "Executing WaterfallSettlement.sol: Tier 3 → Tier 2 → Tier 1 → Tier 0.",
    delayMs: 900,
    hasTxHash: true,
  },
  {
    sagaName: "WaterfallSettlementSaga",
    step: "COLLATERAL_RELEASED",
    details: "₹1,12,500 collateral margin released from vault back to MSME wallet.",
    delayMs: 500,
    hasTxHash: true,
  },
  {
    sagaName: "WaterfallSettlementSaga",
    step: "REPUTATION_UPGRADE",
    details: "MSME Reputation upgraded: Level 1 → Level 2. New Tier 0 Cap: ₹2,50,000.",
    delayMs: 400,
  },
];

export const DEFAULT_STEPS: SagaStep[] = [
  {
    sagaName: "DefaultLiquidationSaga",
    step: "GRACE_PERIOD_EXPIRED",
    details: "72-hour grace period expired. Buyer Tata Motors has not settled. Initiating liquidation.",
    delayMs: 600,
  },
  {
    sagaName: "DefaultLiquidationSaga",
    step: "COLLATERAL_VAULT_LIQUIDATED",
    details: "Seized ₹1,12,500 from CollateralVault.sol. Senior Tier 3 & Tier 2 investors made whole.",
    delayMs: 800,
    hasTxHash: true,
  },
  {
    sagaName: "DefaultLiquidationSaga",
    step: "REPUTATION_DOWNGRADE",
    details: "MSME Reputation downgraded. Tier 0 Cap slashed to ₹25,000.",
    delayMs: 400,
  },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
