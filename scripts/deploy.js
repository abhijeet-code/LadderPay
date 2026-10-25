const hre = require("hardhat");

async function main() {
  console.log("Starting LadderPay smart contract deployment on", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  if (deployer) {
    console.log("Deploying with account:", deployer.address);
  }

  // 1. Deploy LadderInvoiceNFT
  const InvoiceNFT = await hre.ethers.getContractFactory("LadderInvoiceNFT");
  const invoiceNFT = await InvoiceNFT.deploy();
  await invoiceNFT.waitForDeployment();
  const invoiceNFTAddress = await invoiceNFT.getAddress();
  console.log("LadderInvoiceNFT deployed to:", invoiceNFTAddress);

  // 2. Deploy LadderTrancheToken
  const TrancheToken = await hre.ethers.getContractFactory("LadderTrancheToken");
  const trancheToken = await TrancheToken.deploy();
  await trancheToken.waitForDeployment();
  const trancheTokenAddress = await trancheToken.getAddress();
  console.log("LadderTrancheToken deployed to:", trancheTokenAddress);

  // 3. Deploy CollateralVault
  const CollateralVault = await hre.ethers.getContractFactory("CollateralVault");
  const collateralVault = await CollateralVault.deploy();
  await collateralVault.waitForDeployment();
  const collateralVaultAddress = await collateralVault.getAddress();
  console.log("CollateralVault deployed to:", collateralVaultAddress);

  // 4. Deploy WaterfallSettlement
  const Waterfall = await hre.ethers.getContractFactory("WaterfallSettlement");
  const waterfall = await Waterfall.deploy(invoiceNFTAddress, trancheTokenAddress, collateralVaultAddress);
  await waterfall.waitForDeployment();
  const waterfallAddress = await waterfall.getAddress();
  console.log("WaterfallSettlement deployed to:", waterfallAddress);

  // 5. Deploy CBDCMockToken (Digital Rupee Rail)
  const CBDCToken = await hre.ethers.getContractFactory("CBDCMockToken");
  const cbdcToken = await CBDCToken.deploy();
  await cbdcToken.waitForDeployment();
  const cbdcTokenAddress = await cbdcToken.getAddress();
  console.log("CBDCMockToken (eINR) deployed to:", cbdcTokenAddress);

  // 6. Wire authorities
  console.log("Configuring cross-contract permissions...");
  await trancheToken.setAuthorities(deployer.address, waterfallAddress);
  await collateralVault.setWaterfallContract(waterfallAddress);
  await cbdcToken.setOrchestrator(deployer.address);

  console.log("\nDeployment completed successfully!");
  console.log("-----------------------------------------");
  console.log(`NEXT_PUBLIC_INVOICE_NFT_ADDRESS="${invoiceNFTAddress}"`);
  console.log(`NEXT_PUBLIC_TRANCHE_TOKEN_ADDRESS="${trancheTokenAddress}"`);
  console.log(`NEXT_PUBLIC_COLLATERAL_VAULT_ADDRESS="${collateralVaultAddress}"`);
  console.log(`NEXT_PUBLIC_WATERFALL_ADDRESS="${waterfallAddress}"`);
  console.log(`NEXT_PUBLIC_CBDC_TOKEN_ADDRESS="${cbdcTokenAddress}"`);
  console.log("-----------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
