const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Sentinel Blockchain Contracts with Certificate Data Support");
  console.log("=".repeat(70));

  const [deployer] = await hre.ethers.getSigners();
  console.log(`📍 Deploying from: ${deployer.address}`);

  // 1. Deploy PointsEngine
  console.log("\n1️⃣  Deploying PointsEngine...");
  const PointsEngine = await hre.ethers.getContractFactory("PointsEngine");
  const pointsEngine = await PointsEngine.deploy();
  await pointsEngine.waitForDeployment();
  const pointsEngineAddr = await pointsEngine.getAddress();
  console.log(`   ✓ PointsEngine: ${pointsEngineAddr}`);

  // 2. Deploy ClubRegistry
  console.log("\n2️⃣  Deploying ClubRegistry...");
  const ClubRegistry = await hre.ethers.getContractFactory("ClubRegistry");
  const clubRegistry = await ClubRegistry.deploy();
  await clubRegistry.waitForDeployment();
  const clubRegistryAddr = await clubRegistry.getAddress();
  console.log(`   ✓ ClubRegistry: ${clubRegistryAddr}`);

  // 3. Deploy VerifierRegistry
  console.log("\n3️⃣  Deploying VerifierRegistry...");
  const VerifierRegistry = await hre.ethers.getContractFactory("VerifierRegistry");
  const verifierRegistry = await VerifierRegistry.deploy();
  await verifierRegistry.waitForDeployment();
  const verifierRegistryAddr = await verifierRegistry.getAddress();
  console.log(`   ✓ VerifierRegistry: ${verifierRegistryAddr}`);

  // 4. Deploy ImpactCertificate (NFT)
  console.log("\n4️⃣  Deploying ImpactCertificate (ERC721)...");
  const ImpactCertificate = await hre.ethers.getContractFactory("ImpactCertificate");
  const impactCertificate = await ImpactCertificate.deploy();
  await impactCertificate.waitForDeployment();
  const impactCertificateAddr = await impactCertificate.getAddress();
  console.log(`   ✓ ImpactCertificate: ${impactCertificateAddr}`);

  // 5. Deploy SentinelClubs (main contract)
  console.log("\n5️⃣  Deploying SentinelClubs...");
  const SentinelClubs = await hre.ethers.getContractFactory("SentinelClubs");
  const sentinelClubs = await SentinelClubs.deploy(pointsEngineAddr);
  await sentinelClubs.waitForDeployment();
  const sentinelClubsAddr = await sentinelClubs.getAddress();
  console.log(`   ✓ SentinelClubs: ${sentinelClubsAddr}`);

  // 6. Deploy CertificateData (stores certificate data from Django)
  console.log("\n6️⃣  Deploying CertificateData...");
  const CertificateData = await hre.ethers.getContractFactory("CertificateData");
  const certificateData = await CertificateData.deploy();
  await certificateData.waitForDeployment();
  const certificateDataAddr = await certificateData.getAddress();
  console.log(`   ✓ CertificateData: ${certificateDataAddr}`);

  // 7. Deploy APIBridge (receives data from Django)
  console.log("\n7️⃣  Deploying APIBridge...");
  const APIBridge = await hre.ethers.getContractFactory("APIBridge");
  const apiBridge = await APIBridge.deploy(certificateDataAddr);
  await apiBridge.waitForDeployment();
  const apiBridgeAddr = await apiBridge.getAddress();
  console.log(`   ✓ APIBridge: ${apiBridgeAddr}`);

  // 8. Deploy OffchainDataHandler (manages IPFS/Arweave refs)
  console.log("\n8️⃣  Deploying OffchainDataHandler...");
  const OffchainDataHandler = await hre.ethers.getContractFactory("OffchainDataHandler");
  const offchainDataHandler = await OffchainDataHandler.deploy();
  await offchainDataHandler.waitForDeployment();
  const offchainDataHandlerAddr = await offchainDataHandler.getAddress();
  console.log(`   ✓ OffchainDataHandler: ${offchainDataHandlerAddr}`);

  // 9. Configure APIBridge as authorized handler in CertificateData
  console.log("\n9️⃣  Configuring contracts...");
  const tx = await certificateData.setAPIHandler(apiBridgeAddr);
  await tx.wait();
  console.log(`   ✓ Set APIBridge as CertificateData handler`);

  // Print summary
  console.log("\n" + "=".repeat(70));
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("=".repeat(70));
  
  console.log("\n📋 Contract Addresses:");
  console.log(`   PointsEngine:          ${pointsEngineAddr}`);
  console.log(`   ClubRegistry:          ${clubRegistryAddr}`);
  console.log(`   VerifierRegistry:      ${verifierRegistryAddr}`);
  console.log(`   ImpactCertificate:     ${impactCertificateAddr}`);
  console.log(`   SentinelClubs:         ${sentinelClubsAddr}`);
  console.log(`   CertificateData:       ${certificateDataAddr}`);
  console.log(`   APIBridge:             ${apiBridgeAddr}`);
  console.log(`   OffchainDataHandler:   ${offchainDataHandlerAddr}`);

  console.log("\n📝 Next Steps:");
  console.log("   1. Save these addresses to your Django backend");
  console.log("   2. Configure APIBridge signer in backend");
  console.log("   3. Set up signal handlers to call APIBridge when data is verified");
  console.log("   4. Upload images to IPFS and record hashes in OffchainDataHandler");

  // Save deployment addresses to file
  const deploymentData = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      pointsEngine: pointsEngineAddr,
      clubRegistry: clubRegistryAddr,
      verifierRegistry: verifierRegistryAddr,
      impactCertificate: impactCertificateAddr,
      sentinelClubs: sentinelClubsAddr,
      certificateData: certificateDataAddr,
      apiBridge: apiBridgeAddr,
      offchainDataHandler: offchainDataHandlerAddr
    }
  };

  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = path.join(deploymentsDir, `${hre.network.name}-${Date.now()}.json`);
  fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));
  console.log(`\n💾 Deployment saved to: ${filename}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
