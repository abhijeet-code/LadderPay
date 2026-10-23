// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CollateralVault
 * @notice Holds MSME posted collateral margin (e.g. sINR, CBDC or native currency).
 * @dev Locked during invoice duration. Released on clean settlement; liquidated on buyer default.
 */
contract CollateralVault {
    address public owner;
    address public waterfallContract;
    address public drunixOrchestrator;

    struct MarginDeposit {
        uint256 invoiceId;
        address msme;
        uint256 amountLockedINR;
        bool isReleased;
        bool isLiquidated;
        uint256 liquidatedAmountINR;
        uint256 depositedAt;
    }

    // invoiceId => MarginDeposit
    mapping(uint256 => MarginDeposit) public deposits;

    event CollateralDeposited(uint256 indexed invoiceId, address indexed msme, uint256 amountINR);
    event CollateralReleased(uint256 indexed invoiceId, address indexed msme, uint256 amountINR);
    event CollateralLiquidated(uint256 indexed invoiceId, address indexed msme, uint256 amountINR, address indexed beneficiary);

    modifier onlyAuthorized() {
        require(msg.sender == owner || msg.sender == waterfallContract || msg.sender == drunixOrchestrator, "Unauthorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        drunixOrchestrator = msg.sender;
    }

    function setWaterfallContract(address _waterfall) external {
        require(msg.sender == owner, "Only owner");
        waterfallContract = _waterfall;
    }

    function depositCollateral(uint256 _invoiceId, address _msme, uint256 _amountINR) external onlyAuthorized {
        require(deposits[_invoiceId].amountLockedINR == 0, "Collateral already deposited for invoice");
        require(_amountINR > 0, "Zero amount");

        deposits[_invoiceId] = MarginDeposit({
            invoiceId: _invoiceId,
            msme: _msme,
            amountLockedINR: _amountINR,
            isReleased: false,
            isLiquidated: false,
            liquidatedAmountINR: 0,
            depositedAt: block.timestamp
        });

        emit CollateralDeposited(_invoiceId, _msme, _amountINR);
    }

    /**
     * @notice Releases collateral back to MSME on clean settlement
     */
    function releaseCollateral(uint256 _invoiceId) external onlyAuthorized {
        MarginDeposit storage dep = deposits[_invoiceId];
        require(!dep.isReleased && !dep.isLiquidated, "Already settled or liquidated");
        require(dep.amountLockedINR > 0, "No deposit found");

        dep.isReleased = true;
        emit CollateralReleased(_invoiceId, dep.msme, dep.amountLockedINR);
    }

    /**
     * @notice Liquidates collateral to compensate senior tranches if buyer defaults
     */
    function liquidateCollateral(uint256 _invoiceId, uint256 _amountToLiquidate, address _beneficiary) external onlyAuthorized returns (uint256) {
        MarginDeposit storage dep = deposits[_invoiceId];
        require(!dep.isReleased, "Collateral already released");
        require(dep.amountLockedINR > 0, "No deposit found");

        uint256 available = dep.amountLockedINR - dep.liquidatedAmountINR;
        uint256 toSeize = _amountToLiquidate > available ? available : _amountToLiquidate;

        dep.liquidatedAmountINR += toSeize;
        if (dep.liquidatedAmountINR == dep.amountLockedINR) {
            dep.isLiquidated = true;
        }

        emit CollateralLiquidated(_invoiceId, dep.msme, toSeize, _beneficiary);
        return toSeize;
    }

    function getDeposit(uint256 _invoiceId) external view returns (MarginDeposit memory) {
        return deposits[_invoiceId];
    }
}
