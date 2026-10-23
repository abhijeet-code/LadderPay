// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LadderTrancheToken
 * @notice ERC-1155 Multi-Token standard for fractional invoice risk tranches.
 * @dev Tranche ID scheme: (invoiceId << 8) | tierIndex (where tier 0 = T0, 1 = T1, 2 = T2, 3 = T3)
 */
contract LadderTrancheToken {
    string public name = "LadderPay Tranche Shares";
    string public symbol = "LP-TRANCHE";

    struct TrancheConfig {
        uint256 invoiceId;
        uint8 tierIndex;          // 0 = Tier 0 (High risk), 1 = Tier 1, 2 = Tier 2, 3 = Tier 3 (Safe)
        uint256 targetAmountINR;  // Principal slice amount (e.g. 100,000)
        uint256 fundedAmountINR;  // Current funded amount
        uint256 annualRateBps;    // e.g. 1800 = 18.00%
        uint256 collateralPercent;// 0%, 25%, 50%, 100%
        bool isClosed;
    }

    address public owner;
    address public waterfallContract;
    address public drunixOrchestrator;

    // Tranche ID => TrancheConfig
    mapping(uint256 => TrancheConfig) public tranches;
    // Tranche ID => Investor address => token balance (units of 1 INR)
    mapping(uint256 => mapping(address => uint256)) public balanceOf;
    // Tranche ID => List of investor addresses
    mapping(uint256 => address[]) private trancheInvestors;
    mapping(uint256 => mapping(address => bool)) private hasInvested;

    event TrancheConfigured(uint256 indexed trancheId, uint256 indexed invoiceId, uint8 tier, uint256 targetAmountINR, uint256 annualRateBps);
    event TrancheFunded(uint256 indexed trancheId, address indexed investor, uint256 amountINR);
    event TrancheClosed(uint256 indexed trancheId, uint256 totalFundedINR);

    modifier onlyAuthorized() {
        require(msg.sender == owner || msg.sender == drunixOrchestrator || msg.sender == waterfallContract, "Unauthorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        drunixOrchestrator = msg.sender;
    }

    function setAuthorities(address _orchestrator, address _waterfall) external {
        require(msg.sender == owner, "Only owner");
        drunixOrchestrator = _orchestrator;
        waterfallContract = _waterfall;
    }

    function calculateTrancheId(uint256 _invoiceId, uint8 _tierIndex) public pure returns (uint256) {
        return (_invoiceId << 8) | uint256(_tierIndex);
    }

    function configureTranche(
        uint256 _invoiceId,
        uint8 _tierIndex,
        uint256 _targetAmountINR,
        uint256 _annualRateBps,
        uint256 _collateralPercent
    ) external onlyAuthorized returns (uint256) {
        uint256 trancheId = calculateTrancheId(_invoiceId, _tierIndex);
        require(tranches[trancheId].targetAmountINR == 0, "Tranche already configured");

        tranches[trancheId] = TrancheConfig({
            invoiceId: _invoiceId,
            tierIndex: _tierIndex,
            targetAmountINR: _targetAmountINR,
            fundedAmountINR: 0,
            annualRateBps: _annualRateBps,
            collateralPercent: _collateralPercent,
            isClosed: false
        });

        emit TrancheConfigured(trancheId, _invoiceId, _tierIndex, _targetAmountINR, _annualRateBps);
        return trancheId;
    }

    /**
     * @notice Allows an investor to purchase fractional tranche tokens
     */
    function investInTranche(uint256 _trancheId, address _investor, uint256 _amountINR) external onlyAuthorized {
        TrancheConfig storage tranche = tranches[_trancheId];
        require(!tranche.isClosed, "Tranche closed");
        require(tranche.targetAmountINR > 0, "Tranche not initialized");
        require(tranche.fundedAmountINR + _amountINR <= tranche.targetAmountINR, "Exceeds tranche target cap");

        tranche.fundedAmountINR += _amountINR;
        balanceOf[_trancheId][_investor] += _amountINR;

        if (!hasInvested[_trancheId][_investor]) {
            hasInvested[_trancheId][_investor] = true;
            trancheInvestors[_trancheId].push(_investor);
        }

        if (tranche.fundedAmountINR == tranche.targetAmountINR) {
            tranche.isClosed = true;
            emit TrancheClosed(_trancheId, tranche.fundedAmountINR);
        }

        emit TrancheFunded(_trancheId, _investor, _amountINR);
    }

    function getTrancheInvestors(uint256 _trancheId) external view returns (address[] memory) {
        return trancheInvestors[_trancheId];
    }

    function getTranche(uint256 _trancheId) external view returns (TrancheConfig memory) {
        return tranches[_trancheId];
    }
}
