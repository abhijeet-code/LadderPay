// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CBDCMockToken
 * @notice Programmable Digital Rupee (eINR / CBDC) Token for NPCI Hackathon Track
 * @dev Implements ERC-20 with purpose-bound escrow locking primitives for MSME invoice margin
 */
contract CBDCMockToken {
    string public name = "Digital Rupee (CBDC)";
    string public symbol = "eINR";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    address public owner;
    address public drunixOrchestrator;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // Purpose-bound margin escrow lock records
    struct MarginLock {
        uint256 invoiceId;
        uint256 amount;
        address beneficiary;
        bool isReleased;
        bool isLiquidated;
    }
    mapping(bytes32 => MarginLock) public marginLocks;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event MarginLocked(bytes32 indexed lockId, uint256 indexed invoiceId, address indexed msme, uint256 amount);
    event MarginReleased(bytes32 indexed lockId, address indexed msme, uint256 amount);
    event MarginLiquidated(bytes32 indexed lockId, address indexed beneficiary, uint256 amount);

    modifier onlyAuthorized() {
        require(msg.sender == owner || msg.sender == drunixOrchestrator, "Unauthorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        drunixOrchestrator = msg.sender;
        // Mint initial supply of 10 Crore eINR for testnet pilot
        _mint(msg.sender, 100_000_000 * 1e18);
    }

    function setOrchestrator(address _orchestrator) external {
        require(msg.sender == owner, "Only owner");
        drunixOrchestrator = _orchestrator;
    }

    function _mint(address _to, uint256 _amount) internal {
        totalSupply += _amount;
        balanceOf[_to] += _amount;
        emit Transfer(address(0), _to, _amount);
    }

    function mint(address _to, uint256 _amount) external onlyAuthorized {
        _mint(_to, _amount);
    }

    function transfer(address _to, uint256 _amount) external returns (bool) {
        require(balanceOf[msg.sender] >= _amount, "Insufficient eINR balance");
        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    function approve(address _spender, uint256 _amount) external returns (bool) {
        allowance[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) external returns (bool) {
        require(balanceOf[_from] >= _amount, "Insufficient eINR balance");
        require(allowance[_from][msg.sender] >= _amount, "Allowance exceeded");
        allowance[_from][msg.sender] -= _amount;
        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(_from, _to, _amount);
        return true;
    }

    /**
     * @notice Programmable CBDC purpose-bound lock for MSME invoice margin
     */
    function lockMargin(
        uint256 _invoiceId,
        address _msme,
        uint256 _amount,
        address _beneficiary
    ) external onlyAuthorized returns (bytes32) {
        require(balanceOf[_msme] >= _amount, "Insufficient eINR balance to post margin");
        balanceOf[_msme] -= _amount;
        balanceOf[address(this)] += _amount;

        bytes32 lockId = keccak256(abi.encodePacked(_invoiceId, _msme, block.timestamp));
        marginLocks[lockId] = MarginLock({
            invoiceId: _invoiceId,
            amount: _amount,
            beneficiary: _beneficiary,
            isReleased: false,
            isLiquidated: false
        });

        emit MarginLocked(lockId, _invoiceId, _msme, _amount);
        return lockId;
    }

    /**
     * @notice Releases purpose-bound CBDC margin back to MSME on clean settlement
     */
    function releaseMargin(bytes32 _lockId, address _msme) external onlyAuthorized {
        MarginLock storage lock = marginLocks[_lockId];
        require(!lock.isReleased && !lock.isLiquidated, "Margin already released or seized");

        lock.isReleased = true;
        balanceOf[address(this)] -= lock.amount;
        balanceOf[_msme] += lock.amount;

        emit MarginReleased(_lockId, _msme, lock.amount);
    }

    /**
     * @notice Programmatic liquidation of CBDC margin to compensate senior tranches
     */
    function liquidateMargin(bytes32 _lockId) external onlyAuthorized {
        MarginLock storage lock = marginLocks[_lockId];
        require(!lock.isReleased && !lock.isLiquidated, "Margin already released or seized");

        lock.isLiquidated = true;
        balanceOf[address(this)] -= lock.amount;
        balanceOf[lock.beneficiary] += lock.amount;

        emit MarginLiquidated(_lockId, lock.beneficiary, lock.amount);
    }
}
