export const TESTNET_CONFIG = {
  polygonAmoy: {
    chainId: "0x13882", // 80002
    chainName: "Polygon Amoy Testnet",
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
    rpcUrls: ["https://rpc-amoy.polygon.technology/"],
    blockExplorerUrls: ["https://amoy.polygonscan.com/"],
  },
  sepolia: {
    chainId: "0xaa36a7", // 11155111
    chainName: "Ethereum Sepolia",
    nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.sepolia.org"],
    blockExplorerUrls: ["https://sepolia.etherscan.io/"],
  },
};

export const CONTRACT_ADDRESSES = {
  invoiceNFT: process.env.NEXT_PUBLIC_INVOICE_NFT_ADDRESS || "0x71C67Ea4e98f79B8C5F6F3Eb03f7a17C0C7257A6",
  trancheToken: process.env.NEXT_PUBLIC_TRANCHE_TOKEN_ADDRESS || "0x98A5B7b6a48f79B8C5F6F3Eb03f7a17C0C729112",
  collateralVault: process.env.NEXT_PUBLIC_COLLATERAL_VAULT_ADDRESS || "0x44E67Ea4e98f79B8C5F6F3Eb03f7a17C0C721098",
  waterfallSettlement: process.env.NEXT_PUBLIC_WATERFALL_ADDRESS || "0x12F67Ea4e98f79B8C5F6F3Eb03f7a17C0C728876",
};

export function truncateHash(hash: string, start = 6, end = 4): string {
  if (!hash) return "";
  if (hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
