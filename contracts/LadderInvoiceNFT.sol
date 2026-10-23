// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LadderInvoiceNFT
 * @notice ERC-721 token representing verified MSME Invoices in LadderPay.
 * @dev Enforces duplicate invoice prevention using SHA-256 fingerprinting of GST IRN & invoice details.
 */
contract LadderInvoiceNFT {
    string public name = "LadderPay Invoice NFT";
    string public symbol = "LP-INV";

    enum InvoiceStatus { CREATED, TRANCHES_MINTED, FUNDED, ACTIVE, SETTLED, DEFAULTED }

    struct InvoiceData {
        bytes32 invoiceHash;       // Hash of GSTIN + IRN + BuyerPAN + InvoiceNo + DueDate
        address msmeAddress;       // MSME Supplier wallet
        address buyerAddress;      // Debtor buyer wallet
        uint256 faceValueINR;      // In Paisa or INR units (e.g., 500,000)
        uint256 dueDate;           // Timestamp of maturity
        uint256 tier0CapINR;       // Max collateral-free uncollateralized limit
        uint256 ladderScore;       // MSME historical reputation level (1 = L1, 2 = L2, etc.)
        InvoiceStatus status;
        uint256 createdAt;
    }

    address public owner;
    address public drunixOrchestrator;
    uint256 public nextInvoiceId = 1;

    mapping(uint256 => InvoiceData) public invoices;
    mapping(bytes32 => bool) public registeredInvoiceHashes; // Anti-double-financing registry
    mapping(uint256 => address) public tokenOwner;
    mapping(address => uint256) public balanceOf;

    event InvoiceMinted(
        uint256 indexed invoiceId,
        bytes32 indexed invoiceHash,
        address indexed msme,
        uint256 faceValueINR,
        uint256 dueDate
    );
    event InvoiceStatusChanged(uint256 indexed invoiceId, InvoiceStatus newStatus);

    modifier onlyOrchestrator() {
        require(msg.sender == drunixOrchestrator || msg.sender == owner, "Unauthorized caller");
        _;
    }

    constructor() {
        owner = msg.sender;
        drunixOrchestrator = msg.sender;
    }

    function setDrunixOrchestrator(address _orchestrator) external {
        require(msg.sender == owner, "Only owner");
        drunixOrchestrator = _orchestrator;
    }

    /**
     * @notice Mints an invoice NFT after off-chain GST verification by Drunix.
     * Reverts if the invoice hash was already tokenized (prevents double factoring).
     */
    function mintInvoice(
        bytes32 _invoiceHash,
        address _msme,
        address _buyer,
        uint256 _faceValueINR,
        uint256 _dueDate,
        uint256 _tier0CapINR,
        uint256 _ladderScore
    ) external onlyOrchestrator returns (uint256) {
        require(!registeredInvoiceHashes[_invoiceHash], "Error: Invoice already tokenized (Double-financing detected)");
        require(_faceValueINR > 0, "Invalid face value");
        require(_dueDate > block.timestamp, "Due date must be in future");

        uint256 invoiceId = nextInvoiceId++;
        registeredInvoiceHashes[_invoiceHash] = true;

        invoices[invoiceId] = InvoiceData({
            invoiceHash: _invoiceHash,
            msmeAddress: _msme,
            buyerAddress: _buyer,
            faceValueINR: _faceValueINR,
            dueDate: _dueDate,
            tier0CapINR: _tier0CapINR,
            ladderScore: _ladderScore,
            status: InvoiceStatus.CREATED,
            createdAt: block.timestamp
        });

        tokenOwner[invoiceId] = _msme;
        balanceOf[_msme]++;

        emit InvoiceMinted(invoiceId, _invoiceHash, _msme, _faceValueINR, _dueDate);
        return invoiceId;
    }

    function updateStatus(uint256 _invoiceId, InvoiceStatus _status) external onlyOrchestrator {
        require(invoices[_invoiceId].invoiceHash != bytes32(0), "Invoice does not exist");
        invoices[_invoiceId].status = _status;
        emit InvoiceStatusChanged(_invoiceId, _status);
    }

    function getInvoice(uint256 _invoiceId) external view returns (InvoiceData memory) {
        return invoices[_invoiceId];
    }
}
