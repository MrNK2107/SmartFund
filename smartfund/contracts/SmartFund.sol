// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SmartFund
 * @notice Programmable, fraud-resistant spending platform.
 *         Spending rules are enforced on-chain — not just in the UI.
 */
contract SmartFund is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ── Data Structures ─────────────────────────────────────────────
    struct Fund {
        uint256 id;
        address creator;
        address token;           // ERC20 token address
        address allowedVendor;   // Primary approved vendor
        bytes32 category;        // keccak256 of category string e.g. "food"
        uint256 maxAmount;       // Per-transaction cap
        uint256 totalDeposited;
        uint256 totalSpent;
        uint256 usageLimit;      // Max number of transactions
        uint256 usageCount;
        uint256 expiry;          // Unix timestamp
        bool active;
    }

    mapping(uint256 => Fund) public funds;
    mapping(uint256 => mapping(address => bool)) public approvedVendors;
    uint256 public fundCounter;

    // ── Events ──────────────────────────────────────────────────────
    event FundCreated(uint256 indexed fundId, address creator, address token);
    event Deposited(uint256 indexed fundId, uint256 amount);
    event PaymentExecuted(uint256 indexed fundId, address vendor, uint256 amount, uint256 timestamp);
    event PaymentRejected(uint256 indexed fundId, address vendor, string reason);
    event FundDeactivated(uint256 indexed fundId);

    // ── Modifiers ───────────────────────────────────────────────────
    modifier onlyFundCreator(uint256 fundId) {
        require(funds[fundId].creator == msg.sender, "Not fund creator");
        _;
    }

    // ── Core Functions ──────────────────────────────────────────────

    /**
     * @notice Create a new fund with spending rules.
     * @param token         ERC20 token address used for this fund
     * @param allowedVendor Primary vendor that can receive payments
     * @param category      Human-readable category (hashed to bytes32)
     * @param maxAmount     Per-transaction spending cap
     * @param usageLimit    Maximum number of transactions
     * @param expiryDuration Duration in seconds before the fund expires
     * @return fundId       The ID of the newly created fund
     */
    function createFund(
        address token,
        address allowedVendor,
        string memory category,
        uint256 maxAmount,
        uint256 usageLimit,
        uint256 expiryDuration
    ) external returns (uint256 fundId) {
        require(token != address(0), "Invalid token address");
        require(allowedVendor != address(0), "Invalid vendor address");
        require(maxAmount > 0, "Max amount must be > 0");
        require(usageLimit > 0, "Usage limit must be > 0");
        require(expiryDuration > 0, "Expiry duration must be > 0");

        fundCounter++;
        fundId = fundCounter;

        funds[fundId] = Fund({
            id: fundId,
            creator: msg.sender,
            token: token,
            allowedVendor: allowedVendor,
            category: keccak256(abi.encodePacked(category)),
            maxAmount: maxAmount,
            totalDeposited: 0,
            totalSpent: 0,
            usageLimit: usageLimit,
            usageCount: 0,
            expiry: block.timestamp + expiryDuration,
            active: true
        });

        // Auto-approve the primary vendor
        approvedVendors[fundId][allowedVendor] = true;

        emit FundCreated(fundId, msg.sender, token);
    }

    /**
     * @notice Deposit ERC20 tokens into a fund.
     * @param fundId Fund to deposit into
     * @param amount Amount of tokens to deposit
     */
    function deposit(uint256 fundId, uint256 amount) external {
        Fund storage fund = funds[fundId];
        require(fund.creator != address(0), "Fund does not exist");
        require(fund.active, "Fund is not active");
        require(amount > 0, "Deposit amount must be > 0");

        IERC20(fund.token).safeTransferFrom(msg.sender, address(this), amount);
        fund.totalDeposited += amount;

        emit Deposited(fundId, amount);
    }

    /**
     * @notice Execute a payment from a fund. All validation happens on-chain.
     * @param fundId Fund to pay from
     * @param vendor Recipient address
     * @param amount Amount to transfer
     */
    function executePayment(
        uint256 fundId,
        address vendor,
        uint256 amount
    ) external nonReentrant {
        Fund storage fund = funds[fundId];

        // ✅ Fund must be active
        if (!fund.active) {
            emit PaymentRejected(fundId, vendor, "Fund is not active");
            revert("Fund is not active");
        }

        // ✅ Current block.timestamp < fund.expiry
        if (block.timestamp >= fund.expiry) {
            emit PaymentRejected(fundId, vendor, "Fund expired");
            revert("Fund expired");
        }

        // ✅ vendor == fund.allowedVendor (or in approvedVendors mapping)
        if (vendor != fund.allowedVendor && !approvedVendors[fundId][vendor]) {
            emit PaymentRejected(fundId, vendor, "Vendor not approved");
            revert("Vendor not approved");
        }

        // ✅ amount <= fund.maxAmount
        if (amount > fund.maxAmount) {
            emit PaymentRejected(fundId, vendor, "Amount exceeds maximum");
            revert("Amount exceeds maximum");
        }

        // ✅ fund.usageCount < fund.usageLimit
        if (fund.usageCount >= fund.usageLimit) {
            emit PaymentRejected(fundId, vendor, "Usage limit reached");
            revert("Usage limit reached");
        }

        // ✅ Contract holds sufficient token balance
        uint256 available = fund.totalDeposited - fund.totalSpent;
        if (amount > available) {
            emit PaymentRejected(fundId, vendor, "Insufficient fund balance");
            revert("Insufficient fund balance");
        }

        // Execute the transfer
        fund.usageCount += 1;
        fund.totalSpent += amount;
        IERC20(fund.token).safeTransfer(vendor, amount);

        emit PaymentExecuted(fundId, vendor, amount, block.timestamp);
    }

    /**
     * @notice Admin can pause or cancel a fund.
     * @param fundId Fund to deactivate
     */
    function deactivateFund(uint256 fundId) external onlyFundCreator(fundId) {
        require(funds[fundId].active, "Fund already inactive");
        funds[fundId].active = false;
        emit FundDeactivated(fundId);
    }

    /**
     * @notice Get full fund details.
     * @param fundId Fund ID to query
     * @return The Fund struct
     */
    function getFund(uint256 fundId) external view returns (Fund memory) {
        return funds[fundId];
    }

    /**
     * @notice Check if a payment would be valid without executing.
     * @param fundId Fund to validate against
     * @param vendor Intended recipient
     * @param amount Intended payment amount
     * @return valid  Whether the payment would succeed
     * @return reason Description of failure (empty if valid)
     */
    function validatePayment(
        uint256 fundId,
        address vendor,
        uint256 amount
    ) external view returns (bool valid, string memory reason) {
        Fund storage fund = funds[fundId];

        if (!fund.active) return (false, "Fund is not active");
        if (block.timestamp >= fund.expiry) return (false, "Fund expired");
        if (vendor != fund.allowedVendor && !approvedVendors[fundId][vendor])
            return (false, "Vendor not approved");
        if (amount > fund.maxAmount) return (false, "Amount exceeds maximum");
        if (fund.usageCount >= fund.usageLimit) return (false, "Usage limit reached");

        uint256 available = fund.totalDeposited - fund.totalSpent;
        if (amount > available) return (false, "Insufficient fund balance");

        return (true, "");
    }
}
