# LadderPay: Tiered, Collateral-Aware Invoice Financing

> **Hackathon:** Drunix + NPCI Hackathon  
> **Track:** Idea C — Real Asset Tokenization  
> **Tagline:** *Cash on your invoice today. The more collateral you post, the more you unlock, and the less you pay.*

---

## 🚀 Live Cloud Deployment Setup (100% Free Tier)

LadderPay is pre-configured for instant zero-cost cloud deployment via GitHub:
- **Frontend / Fullstack Web App:** Runs on **Vercel** (Hobby Free Plan)
- **Backend & Drunix Orchestrator:** Runs on **Render** (Free Web Service) or directly via Next.js API Routes on Vercel
- **Smart Contracts:** Deployed on **Polygon Amoy Testnet** (Free public RPCs & faucets)

---

## 📁 Repository Structure

```
ladderpay/
├── app/                          # Next.js 14 App Router (Fullstack Vercel App)
│   ├── api/                      # Next.js Serverless API endpoints
│   │   ├── invoice/create/       # Mock GST check & IRN tier cap calculator
│   │   ├── settle/               # Reverse waterfall settlement processor
│   │   └── drunix-status/        # Drunix state machine health check
│   ├── components/               # Interactive Hackathon Dashboards
│   │   ├── Navbar.tsx            # Live rail badges & mode toggles
│   │   ├── MSMEDashboard.tsx     # Dynamic Tier Ladder & UPI disbursal tracker
│   │   ├── InvestorMarketplace.tsx# ERC-1155 fractional tranche pool
│   │   ├── BuyerPortal.tsx       # Corporate Tata Motors UPI QR checkout
│   │   ├── DrunixVisualizer.tsx  # Live Drunix saga timeline & idempotency logs
│   │   └── DefaultSimulatorModal.tsx # Risk awareness collateral liquidation demo
│   ├── globals.css               # Modern dark fintech styles
│   ├── layout.tsx                # App root layout
│   └── page.tsx                  # Unified reactive demo orchestrator
├── backend/                      # Standalone Express Orchestrator for Render
│   ├── Dockerfile
│   ├── package.json
│   └── server.js                 # Drunix state machine & NPCI webhook simulator
├── contracts/                    # EVM Smart Contracts (Solidity 0.8.20)
│   ├── LadderInvoiceNFT.sol      # ERC-721: Anti-duplicate invoice factoring
│   ├── LadderTrancheToken.sol    # ERC-1155: Multi-tier fractional shares (T0-T3)
│   ├── CollateralVault.sol       # Locked margin escrow & liquidation engine
│   └── WaterfallSettlement.sol   # Reverse waterfall priority repayment
├── lib/
│   ├── store.ts                  # Reactive demo state (Ramesh ₹5L invoice)
│   ├── types.ts                  # TypeScript definitions
│   └── web3.ts                   # Polygon Amoy & Sepolia RPC configurations
├── render.yaml                   # 1-click Render blueprint
├── vercel.json                   # Vercel deployment config
└── hardhat.config.js             # Solidity build configuration
```
