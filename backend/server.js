const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Health check endpoint for Render
app.get("/", (req, res) => {
  res.json({
    status: "ONLINE",
    service: "LadderPay Drunix Orchestrator & NPCI Rails Backend",
    version: "1.0.0",
    docs: "/api/status",
  });
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Drunix status endpoint
app.get("/api/status", (req, res) => {
  res.json({
    orchestrator: "Drunix State Machine",
    rails: {
      npciUPI: "READY",
      npciCBDC: "ACTIVE_PROGRAMMABLE_ESCROW",
      polygonAmoyTestnet: "CONNECTED",
      sepoliaTestnet: "STANDBY",
    },
    uptime: process.uptime(),
  });
});

// Digital Rupee (CBDC) purpose-bound margin lock webhook
app.post("/api/npci/cbdc/lock", (req, res) => {
  const { invoiceId, msmeWallet, marginINR } = req.body;
  const lockHash = "0x" + Math.random().toString(16).substring(2, 42);
  console.log(`[Drunix] CBDC margin lock: ₹${marginINR} locked for invoice ${invoiceId}`);
  res.json({
    success: true,
    lockHash,
    rail: "NPCI_DIGITAL_RUPEE_CBDC",
    status: "MARGIN_HELD_IN_ESCROW",
  });
});

// NPCI UPI Webhook listener (simulated)
app.post("/api/npci/webhook/payout", (req, res) => {
  const { vpa, amountINR, idempotencyKey } = req.body;
  const utr = `NPCI/UPI/${new Date().toISOString().slice(0, 10).replace(/-/g, "")}/${Math.floor(
    100000000 + Math.random() * 900000000
  )}`;

  console.log(`[Drunix] Disbursed ₹${amountINR} to ${vpa} with UTR: ${utr}`);

  res.json({
    success: true,
    utr,
    idempotencyKey,
    status: "CREDITED_SUCCESSFULLY",
    timestamp: new Date().toISOString(),
  });
});

// NPCI Buyer UPI settlement webhook
app.post("/api/npci/webhook/collect", (req, res) => {
  const { invoiceId, amountINR, buyerVpa } = req.body;
  console.log(`[Drunix] Collected ₹${amountINR} from ${buyerVpa} for invoice ${invoiceId}`);

  res.json({
    success: true,
    invoiceId,
    amountReceivedINR: amountINR,
    status: "SETTLEMENT_INITIATED",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`LadderPay Drunix Backend listening on port ${PORT}`);
});
