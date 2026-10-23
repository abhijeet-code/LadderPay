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

---

## 🚢 How to Deploy to GitHub, Vercel & Render

### Step 1: Push to GitHub

From your terminal or Git client:
```bash
cd ladderpay
git init
git add .
git commit -m "feat: LadderPay end-to-end hackathon prototype"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/ladderpay.git
git push -u origin main
```

---

### Step 2: Deploy Frontend on Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **"Add New Project"** and select your `ladderpay` repository.
3. Keep default settings (Framework Preset: **Next.js**, Root Directory: `./`).
4. Click **"Deploy"**. Vercel will build and assign you a live HTTPS domain (e.g., `https://ladderpay.vercel.app`) in under 90 seconds!

---

### Step 3: Deploy Backend on Render (Optional Free Web Service)

If you wish to run the standalone Drunix orchestrator service on Render:
1. Log in to [render.com](https://render.com).
2. Click **"New +"** $\rightarrow$ **"Web Service"** $\rightarrow$ Connect your GitHub repo.
3. Set **Root Directory** to `backend`.
4. Build Command: `npm install` | Start Command: `node server.js`.
5. Instance Type: **Free**.
6. Click **"Create Web Service"**.

---

## 💡 The 3-Minute Hackathon Demo Script (How to Pitch to Judges)

1. **Phase 1: MSME Instant Liquidity (Ramesh's ₹5 Lakh Invoice)**
   - Open **MSME Portal**. Show verified GST e-invoice for buyer *Tata Motors*.
   - Point out Ramesh's **Reputation Ladder Level 1**: Tier 0 is unlocked up to ₹1,00,000 completely collateral-free at 18% APY.
   - Adjust the **Tier Ladder**: Ramesh posts ₹1,12,500 margin in `CollateralVault.sol` to unlock Tiers 1 and 2 at much cheaper rates (14% and 11%).
   - Show instant **UPI Disbursal**: ₹4,35,000 credited to `ramesh.steel@okhdfcbank` with UTR in &lt; 10 minutes.

2. **Phase 2: Investor Marketplace (ERC-1155 Fractional Tranches)**
   - Switch to **Investor Marketplace**.
   - Show high-yield investors taking Tier 0 (18% APY, absorbing first-loss).
   - Show conservative institutions taking Tier 1 & 2 (11–14% APY with 25–50% locked margin protection).
   - Click **Invest** to demonstrate fractional pool subscription (as low as ₹1,000).

3. **Phase 3: Clean Maturity & Reverse Waterfall (Day 90)**
   - Switch to **Buyer Portal (Tata Motors)**.
   - Click **"Pay via NPCI UPI"**. Show the simulated UPI QR & AutoPay checkout for ₹5,00,000.
   - Authorize payment. Watch Drunix fire the on-chain `WaterfallSettlement.sol`:
     - Senior Tier 2 & Tier 1 repaid first + interest.
     - Junior Tier 0 repaid next + interest.
     - Ramesh's ₹1,12,500 collateral unlocked back to his wallet.
     - Ramesh's 10% reserve (₹50,000) disbursed.
     - Ramesh's **Reputation Ladder upgraded to Level 2** (new Tier 0 cap jumps to ₹2,50,000).

4. **Phase 4: Risk Awareness Showcase (Default & Liquidation Demo)**
   - Click **"Simulate Default"** in the top navigation bar.
   - Simulate a shortfall where the buyer defaults on ₹1,50,000.
   - Show automatic smart contract liquidation: Ramesh's locked collateral is seized to make Senior Tier 2 & 3 investors 100% whole!
   - Shows judges that LadderPay is institutional-grade and prevents systemic contagion.

---

## 🏆 Key Judge Questions & Defenses

- **Q: How is this different from TReDS?**  
  *A:* TReDS is all-or-nothing and caters mainly to AAA corporates and large MSMEs. LadderPay introduces fractional risk tranches with dynamic collateral matching, allowing smaller MSMEs to access funding and build their uncollateralized credit limit through our reputation ladder.
- **Q: What is the regulatory status in India?**  
  *A:* Designed for the **RBI Regulatory Sandbox for Factoring & Digital Lending**. Tokens act as evidentiary assignment records under the *Factoring Regulation Act, 2011*, with all fiat settlements strictly flowing through NPCI UPI rails via a licensed NBFC-Factor partner.
- **Q: How is double-financing stopped?**  
  *A:* Cryptographic SHA-256 fingerprinting of the GST IRN and invoice parameters registered in `LadderInvoiceNFT.sol` on-chain, preventing duplicate financing across all platforms.
