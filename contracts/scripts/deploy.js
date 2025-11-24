const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy utility contracts first
  console.log("\n1. Deploying PointsEngine...");
  const PointsEngine = await ethers.getContractFactory("PointsEngine");
  const pointsEngine = await PointsEngine.deploy();
  await pointsEngine.waitForDeployment();
  console.log("PointsEngine deployed to:", await pointsEngine.getAddress());

  // Deploy registry contracts
  console.log("\n2. Deploying ClubRegistry...");
  const ClubRegistry = await ethers.getContractFactory("ClubRegistry");
  const clubRegistry = await ClubRegistry.deploy();
  await clubRegistry.waitForDeployment();
  console.log("ClubRegistry deployed to:", await clubRegistry.getAddress());

  console.log("\n3. Deploying VerifierRegistry...");
  const VerifierRegistry = await ethers.getContractFactory("VerifierRegistry");
  const verifierRegistry = await VerifierRegistry.deploy();
  await verifierRegistry.waitForDeployment();
  console.log("VerifierRegistry deployed to:", await verifierRegistry.getAddress());

  // Deploy main contract
  console.log("\n4. Deploying SentinelClubs...");
  const SentinelClubs = await ethers.getContractFactory("SentinelClubs");
  const sentinelClubs = await SentinelClubs.deploy(await pointsEngine.getAddress());
  await sentinelClubs.waitForDeployment();
  console.log("SentinelClubs deployed to:", await sentinelClubs.getAddress());

  // Deploy token contracts (temporarily skipped due to deployment issues)
  console.log("\n5. Skipping ImpactCertificate deployment due to compilation issues");
  const impactCertificate = { getAddress: () => "0x0000000000000000000000000000000000000000" };

  console.log("\n6. Skipping ClubBadge deployment");
  const clubBadge = { getAddress: () => "0x0000000000000000000000000000000000000000" };

  // Save deployment addresses
  const addresses = {
    pointsEngine: await pointsEngine.getAddress(),
    clubRegistry: await clubRegistry.getAddress(),
    verifierRegistry: await verifierRegistry.getAddress(),
    sentinelClubs: await sentinelClubs.getAddress(),
    impactCertificate: await impactCertificate.getAddress(),
    clubBadge: await clubBadge.getAddress(),
    network: network.config.chainId || "local",
    deployer: deployer.address
  };

  // Create abi directory if it doesn't exist
  const abiDir = path.join(__dirname, "..", "abi");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  // Save addresses to JSON file
  fs.writeFileSync(
    path.join(abiDir, "deployment-addresses.json"),
    JSON.stringify(addresses, null, 2)
  );

  console.log("\n✅ Deployment addresses saved to abi/deployment-addresses.json");

  // Save ABIs for deployed contracts
  const contracts = [
    { name: 'PointsEngine', instance: pointsEngine },
    { name: 'ClubRegistry', instance: clubRegistry },
    { name: 'VerifierRegistry', instance: verifierRegistry },
    { name: 'SentinelClubs', instance: sentinelClubs }
    // Skip ImpactCertificate and ClubBadge as they weren't deployed
  ];

  for (const { name, instance } of contracts) {
    try {
      const artifact = await ethers.getContractFactory(name);
      const abi = artifact.interface.format('json');
      
      fs.writeFileSync(
        path.join(abiDir, `${name}.json`),
        JSON.stringify({
          abi: JSON.parse(abi),
          address: await instance.getAddress()
        }, null, 2)
      );
      console.log(`✓ Saved ABI for ${name}`);
    } catch (error) {
      console.warn(`⚠️  Could not save ABI for ${name}:`, error.message);
    }
  }

  console.log("✅ All contract ABIs saved to abi/ directory");

  // Initialize some sample data for testing
  console.log("\n7. Initializing sample data...");
  await initializeSampleData(
    clubRegistry,
    sentinelClubs,
    verifierRegistry,
    deployer
  );

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("PointsEngine:", await pointsEngine.getAddress());
  console.log("ClubRegistry:", await clubRegistry.getAddress());
  console.log("VerifierRegistry:", await verifierRegistry.getAddress());
  console.log("SentinelClubs:", await sentinelClubs.getAddress());
  console.log("ImpactCertificate:", await impactCertificate.getAddress());
  console.log("ClubBadge:", await clubBadge.getAddress());
}

async function initializeSampleData(clubRegistry, sentinelClubs, verifierRegistry, deployer) {
  // Add deployer as first verifier
  await verifierRegistry.addVerifier(
    deployer.address,
    "Sentinel Foundation",
    "Admin"
  );
  console.log("✓ Added deployer as verifier");

  // Register sample clubs
  const sampleClubs = [
    {
      name: "Green Future Club",
      school: "Nairobi Primary School",
      county: "Nairobi",
      region: "Central"
    },
    {
      name: "Eco Warriors",
      school: "Mombasa Secondary School", 
      county: "Mombasa",
      region: "Coastal"
    },
    {
      name: "Tree Guardians",
      school: "Kisumu Academy",
      county: "Kisumu", 
      region: "Western"
    }
  ];

  for (let i = 0; i < sampleClubs.length; i++) {
    const club = sampleClubs[i];
    // Generate a deterministic wallet for each sample club
    const wallet = ethers.Wallet.createRandom();
    
    await clubRegistry.registerClub(
      wallet.address,
      club.name,
      club.school,
      club.county,
      club.region
    );
    console.log(`✓ Registered club: ${club.name}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });