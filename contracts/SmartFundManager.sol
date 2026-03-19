// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SmartFundManager is Ownable {
    IERC20 public immutable token;

    struct Fund {
        address owner;
        address allowedReceiver;
        uint256 maxAmount;
        uint256 expiryTimestamp;
        uint256 usageLimit;
        uint256 used;
        uint256 balance;
    }

    uint256 public fundCount;
    mapping(uint256 => Fund) public funds;
    mapping(address => uint256[]) public userFunds;

    event FundCreated(uint256 indexed fundId, address indexed owner, address allowedReceiver, uint256 maxAmount, uint256 expiryTimestamp, uint256 usageLimit);
    event PaymentExecuted(uint256 indexed fundId, address indexed receiver, uint256 amount);
    event PaymentRejected(uint256 indexed fundId, address indexed receiver, string reason);

    constructor(address _token) {
        token = IERC20(_token);
    }

    function createFund(
        address user,
        address allowedReceiver,
        uint256 maxAmount,
        uint256 expiryTimestamp,
        uint256 usageLimit
    ) external onlyOwner returns (uint256) {
        require(user != address(0), "Invalid user");
        require(allowedReceiver != address(0), "Invalid receiver");
        require(maxAmount > 0, "Amount must be > 0");
        require(expiryTimestamp > block.timestamp, "Expiry in past");
        require(usageLimit > 0, "Usage limit must be > 0");

        fundCount++;
        funds[fundCount] = Fund({
            owner: user,
            allowedReceiver: allowedReceiver,
            maxAmount: maxAmount,
            expiryTimestamp: expiryTimestamp,
            usageLimit: usageLimit,
            used: 0,
            balance: 0
        });
        userFunds[user].push(fundCount);

        emit FundCreated(fundCount, user, allowedReceiver, maxAmount, expiryTimestamp, usageLimit);
        return fundCount;
    }

    function depositToFund(uint256 fundId, uint256 amount) external onlyOwner {
        Fund storage fund = funds[fundId];
        require(fund.owner != address(0), "Fund not found");
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        fund.balance += amount;
    }

    function requestPayment(uint256 fundId, uint256 amount, address receiver) external {
        Fund storage fund = funds[fundId];
        if (fund.owner != msg.sender) {
            emit PaymentRejected(fundId, receiver, "Not fund owner");
            revert("Not fund owner");
        }
        if (block.timestamp > fund.expiryTimestamp) {
            emit PaymentRejected(fundId, receiver, "Fund expired");
            revert("Fund expired");
        }
        if (receiver != fund.allowedReceiver) {
            emit PaymentRejected(fundId, receiver, "Unauthorized receiver");
            revert("Unauthorized receiver");
        }
        if (fund.used >= fund.usageLimit) {
            emit PaymentRejected(fundId, receiver, "Usage limit exceeded");
            revert("Usage limit exceeded");
        }
        if (amount > fund.maxAmount) {
            emit PaymentRejected(fundId, receiver, "Amount exceeds max");
            revert("Amount exceeds max");
        }
        if (amount > fund.balance) {
            emit PaymentRejected(fundId, receiver, "Insufficient fund balance");
            revert("Insufficient fund balance");
        }

        fund.used += 1;
        fund.balance -= amount;
        require(token.transfer(receiver, amount), "Token payout failed");
        emit PaymentExecuted(fundId, receiver, amount);
    }

    function getUserFunds(address user) external view returns (uint256[] memory) {
        return userFunds[user];
    }
}
