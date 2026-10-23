// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LadderInvoiceNFT.sol";
import "./LadderTrancheToken.sol";
import "./CollateralVault.sol";

/**
 * @title WaterfallSettlement
 * @notice Distributes maturity payments using strict reverse waterfall priority:
 * Tier 3 (Senior/Safe) -> Tier 2 -> Tier 1 -> Tier 0 (Junior/First Loss) -> MSME Reserve.
 */
contract WaterfallSettlement {
    address public owner;
    address public drunixOrchestrator;

    LadderInvoiceNFT public invoiceNFT;
    LadderTrancheToken public trancheToken;
    CollateralVault public collateralVault;

    struct SettlementRecord {
        uint256 invoiceId;
        uint256 totalRepaidINR;
        uint256 tier3PaidINR;
        uint256 tier2PaidINR;
        uint256 tier1PaidINR;
        uint256 tier0PaidINR;
        uint256 reserveReleasedINR;
        bool isDefault;
        uint256 liquidatedCollateralINR;
        uint256 settledAt;
    }

    mapping(uint256 => SettlementRecord) public settlements;

    event WaterfallExecuted(
        uint256 indexed invoiceId,
        uint256 totalRepaidINR,
        uint256 reserveReleasedINR,
        bool isDefault
    );

    event TrancheRepaid(uint256 indexed invoiceId, uint8 indexed tierIndex, uint256 amountINR);

    modifier onlyOrchestrator() {
        require(msg.sender == drunixOrchestrator || msg.sender == owner, "Only Drunix or Owner");
        _;
    }

    constructor(
        address _invoiceNFT,
        address _trancheToken,
        address _collateralVault
    ) {
        owner = msg.sender;
        drunixOrchestrator = msg.sender;
        invoiceNFT = LadderInvoiceNFT(_invoiceNFT);
        trancheToken = LadderTrancheToken(_trancheToken);
        collateralVault = CollateralVault(_collateralVault);
    }

    function setOrchestrator(address _orchestrator) external {
        require(msg.sender == owner, "Only owner");
        drunixOrchestrator = _orchestrator;
    }

    /**
     * @notice Executes reverse waterfall settlement for an invoice
     * @param _invoiceId The ID of the tokenized invoice
     * @param _repaymentAmountINR Amount collected from buyer via UPI (e.g. ₹5,00,000)
     */
    function executeWaterfall(uint256 _invoiceId, uint256 _repaymentAmountINR) external onlyOrchestrator {
        require(settlements[_invoiceId].settledAt == 0, "Invoice already settled");
        LadderInvoiceNFT.InvoiceData memory inv = invoiceNFT.getInvoice(_invoiceId);
        require(inv.faceValueINR > 0, "Invoice not found");

        uint256 remaining = _repaymentAmountINR;
        uint256[4] memory paidPerTier;

        // Repay Senior tranches first: Tier 3 -> Tier 2 -> Tier 1 -> Tier 0
        for (int8 t = 3; t >= 0; t--) {
            uint8 tier = uint8(t);
            uint256 trancheId = trancheToken.calculateTrancheId(_invoiceId, tier);
            LadderTrancheToken.TrancheConfig memory config = trancheToken.getTranche(trancheId);

            if (config.targetAmountINR > 0) {
                // Principal + 90-day yield calculation (annualRateBps * 90 / 365)
                uint256 yieldAmount = (config.fundedAmountINR * config.annualRateBps * 90) / (365 * 10000);
                uint256 totalOwed = config.fundedAmountINR + yieldAmount;

                if (remaining >= totalOwed) {
                    paidPerTier[tier] = totalOwed;
                    remaining -= totalOwed;
                } else {
                    paidPerTier[tier] = remaining;
                    remaining = 0;
                }
                emit TrancheRepaid(_invoiceId, tier, paidPerTier[tier]);
            }
        }

        // Check if there was a default or shortfall
        bool isDefault = false;
        uint256 liquidated = 0;

        // If total repayment was less than full face value, trigger collateral liquidation
        if (_repaymentAmountINR < inv.faceValueINR) {
            isDefault = true;
            uint256 deficit = inv.faceValueINR - _repaymentAmountINR;
            liquidated = collateralVault.liquidateCollateral(_invoiceId, deficit, address(this));
            invoiceNFT.updateStatus(_invoiceId, LadderInvoiceNFT.InvoiceStatus.DEFAULTED);
        } else {
            // Clean settlement: release collateral & payout reserve to MSME
            collateralVault.releaseCollateral(_invoiceId);
            invoiceNFT.updateStatus(_invoiceId, LadderInvoiceNFT.InvoiceStatus.SETTLED);
        }

        settlements[_invoiceId] = SettlementRecord({
            invoiceId: _invoiceId,
            totalRepaidINR: _repaymentAmountINR,
            tier3PaidINR: paidPerTier[3],
            tier2PaidINR: paidPerTier[2],
            tier1PaidINR: paidPerTier[1],
            tier0PaidINR: paidPerTier[0],
            reserveReleasedINR: remaining,
            isDefault: isDefault,
            liquidatedCollateralINR: liquidated,
            settledAt: block.timestamp
        });

        emit WaterfallExecuted(_invoiceId, _repaymentAmountINR, remaining, isDefault);
    }

    function getSettlement(uint256 _invoiceId) external view returns (SettlementRecord memory) {
        return settlements[_invoiceId];
    }
}
