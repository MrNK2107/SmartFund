# SmartFund: Comprehensive Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Core Modules & Features](#core-modules--features)
4. [Smart Contract Infrastructure](#smart-contract-infrastructure)
5. [Fraud Prevention & Security](#fraud-prevention--security)
6. [Local Setup & Installation](#local-setup--installation)
7. [Deployment Guide](#deployment-guide)
8. [Usage Guide](#usage-guide)

---

## Project Overview

**SmartFund** (also known as Smart Spend Control) is an enterprise-grade, Web3-powered financial operations platform. It enables organizations to create programmable, self-executing spend categories and limits. By bridging modern React-based frontend experiences with immutable, mathematically secure blockchain execution, SmartFund entirely eliminates unauthorized spending, manual transaction reconciliation, and vendor fraud.

Unlike traditional financial systems where spend policies are enforced *after* a transaction occurs or rely on centralized, exploitable databases, SmartFund enforces all spending rules **on-chain, before the transaction is finalized**. All assets are managed via USD-pegged stablecoins (e.g., USDC), and constraints such as merchant origin, expiry time, and capital caps are mathematically guaranteed by Ethereum Virtual Machine (EVM) smart contracts.

---

## Architecture

SmartFund uses a modern decoupled architecture consisting of a Web3 React frontend and EVM-compatible Solidity smart contracts.

### Frontend Tech Stack
* **Framework:** React 18, Vite, TypeScript
* **State Management:** React Context API for global blockchain state (`SmartFundContext`), TanStack Query.
* **Styling & UI:** Tailwind CSS, shadcn/ui components, Radix UI primitives.
* **Data Visualization:** Recharts for financial dashboards.
* **Web3 Integration:** ethers.js (v6) for blockchain interaction and wallet connection.

### Blockchain Tech Stack
* **Smart Contracts:** Solidity `^0.8.20`
* **Security Standards:** OpenZeppelin (ERC20 standard, `SafeERC20`, `ReentrancyGuard`)
* **Development Environment:** Hardhat for compiling, local node running, and EVM testing.
* **Target Networks:** Fully compatible with EVM chains (Ethereum Mainnet, Polygon, Arbitrum, Optimism).

---

## Core Modules & Features

The platform comprises an integrated suite of financial tools interacting seamlessly with the underlying smart contracts.

### 1. Dashboard (`Dashboard.tsx`)
The Mission Control center. It aggregates real-time blockchain data to render comprehensive metrics:
* Total capital locked across all active funds.
* Real-time spending velocities and remaining limits.
* Historical transaction trend charts.
* High-level views of the organization's "Smart Wallet".

### 2. Smart Wallet (`SmartWallet.tsx`)
The gateway for capital entry/exit. Users connect their Web3 wallets (e.g., MetaMask, WalletConnect) to the platform.
* Reads balances of accepted ERC20 tokens (e.g., USDC).
* Interfaces with the underlying contracts to deposit tokens into specific, rule-bound "Funds".
* Tracks internal ledger balances versus global wallet balances natively.

### 3. Fund Creator (`FundCreator.tsx`)
The policy engine UI. Authorizes the creation of new `Fund` structs on the blockchain.
* **Capital Allocation:** Sets the `maxAmount` and `totalDeposited`.
* **Vendor Whitelisting:** Assigns specific `allowedVendor` addresses (cryptographic wallet addresses) that are singularly authorized to receive payments.
* **Temporal Rules:** Assigns `expiry` timestamps, automatically freezing the fund once elapsed.
* **Velocity Rules:** Limits the total number of transactions (`usageLimit`).

### 4. Payment Engine (`PaymentEngine.tsx`)
The transaction execution layer. Facilitates B2B or B2C payments utilizing the established funds.
* Prompts users for destination vendor addresses and payment amounts.
* Pre-flights the transaction using `validatePayment` on-chain, rendering precise error UI rather than reverting a gas-costly transaction.
* Triggers the `executePayment` smart contract call, permanently logging the event upon success.

### 5. Transaction Log (`TransactionLog.tsx`)
A pristine, cryptographically verifiable ledger.
* Fetches all events emitted by the `SmartFund.sol` contract (e.g., `FundCreated`, `Deposited`, `PaymentExecuted`, `PaymentRejected`).
* Presents the data in filterable, sortable enterprise data tables.

### 6. Fraud Detection & Prevention Engine (`FraudSimulation.tsx`)
Monitors the network for out-of-bounds payment attempts. Tracks blocked transactions due to policy violations, providing security teams with metrics on attempted vendor fraud, expired capital usage, and limit breaches.

---

## Smart Contract Infrastructure

All business logic execution strictly resides on-chain.

### `SmartFund.sol`
The core protocol contract, implementing the programmable spending rules. Extends OpenZeppelin’s `ReentrancyGuard` to prevent re-entrant attacks.

#### Key Functions:
* `createFund(...)`: Instantiates a new policy record. Hushes metadata (like category names) to `bytes32` for gas efficiency. Emits `FundCreated`.
* `deposit(uint256 fundId, uint256 amount)`: Pulls ERC20 tokens from the admin to the contract using `safeTransferFrom`, vaulting the capital securely.
* `executePayment(uint256 fundId, address vendor, uint256 amount)`: The crown jewel. Sequentially validates:
  1. Fund initialization status (`active`).
  2. Temporal validity (`block.timestamp < fund.expiry`).
  3. Vendor authorization (`vendor == allowedVendor || approvedVendors[vendor]`).
  4. Capital caps (`amount <= maxAmount`).
  5. Velocity caps (`usageCount < usageLimit`).
  6. Vault balance sufficiency.
  If all checks pass, it releases capital via `safeTransfer`.
* `validatePayment(...)`: A `view` function allowing off-chain clients to simulate transactions, significantly saving user gas by predicting reverts.

### `SmartFundMultiVendor.sol`
An extension contract architecture that scales the 1-to-1 fund limits to dynamic whitelists, allowing large departments to spend from a unified budget across pre-approved vendor networks seamlessly.

### `MockUSDC.sol`
A standard ERC20 contract primarily utilized for deterministic, rapid test environments and integration testing on local nodes.

---

## Fraud Prevention & Security

SmartFund takes a proactive, mathematically enforced approach to fraud prevention rather than relying on retroactive human policing.

1. **Transaction Reversion:** The moment a transaction step breaches a rule (e.g., sending funds to a non-whitelisted wallet, attempting to spend $501 when the limit is $500), the EVM instantly causes the transaction to revert. The funds never leave the smart contract.
2. **Re-Entrancy Hardening:** State variables are strictly updated *before* external token transfers occur.
3. **Immutable Logs:** Through EVM Events (e.g., `PaymentRejected`), security teams maintain permanent, unalterable logs of *who* attempted the fraudulent transaction and *why* it was blocked.
4. **Decentralized Custody:** Funds are custodied by audited, deterministic code, drastically reducing the risk vector of centralized database manipulation.

---

## Local Setup & Installation

### Prerequisites
* Node.js (v18+ recommended)
* Bun or npm
* A Web3 wallet installed in your browser (e.g., MetaMask)

### 1. Smart Contract local environment
Open a dedicated terminal session.

```bash
cd smartfund
npm install
# Compile the Solidity contracts
npx hardhat compile
# Start a local EVM node
npx hardhat node
```

### 2. Frontend environment
Open a new terminal.

```bash
# In the root project directory -> c:\Users\admin\Desktop\smart-spend-control
npm install
# Start the Vite development server
npm run dev
```
Navigate to `http://localhost:8080` (or as dictated by your dev server console).

---

## Deployment Guide

### Smart Contracts (Hardhat)
To deploy the infrastructure to an actual EVM chain (e.g., Polygon Mainnet):
1. Configure `smartfund/hardhat.config.ts` with your RPC URL and private key.
2. Ensure you have native gas tokens on the target network.
3. Run the deployment script:
   ```bash
   cd smartfund
   npx hardhat run scripts/deploy.ts --network polygon
   ```
4. Note the output contract addresses, and update the frontend configuration (`src/lib/constants` or equivalent environment variables).

### Frontend
The robust application can be built for production:
```bash
npm run build
```
The output directory `dist/` contains the minified, production-ready SPA that can be statically hosted via AWS S3/CloudFront, Vercel, or Netlify.

---

## Usage Guide

1. **Connect Wallet:** The administrator initializes interaction by connecting their Web3 wallet. Ensure the network matches your deployment target (e.g., Localhost 8545 for testing, or Polygon Mainnet for production).
2. **Deposit Working Capital:** Convert fiat to stablecoins (e.g., USDC) and load them into the Smart Wallet.
3. **Policy Initialization:** Navigate to the **Fund Creator**. Design a budget allocation structure. Input the crypto wallet address for your authorized vendor. Define the parameters. Sign the `createFund` transaction.
4. **Fund the Policy:** Trigger a `deposit` transaction to physically lock USDC into the newly created rule-set.
5. **Execute Payments:** Navigate to the **Payment Engine**. Enter instructions. The application will dry-run the instructions against the `validatePayment` view function. If successful, sign the transaction. If it breaches policy, it will be instantly blocked by the frontend UI, averting gas fees. 
6. **Audit & Reconcile:** Leverage the **Transaction Log** and **Dashboard** to export fully reconciled accounts payable data.
