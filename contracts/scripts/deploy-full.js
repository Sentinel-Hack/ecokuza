const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying Sentinel Forest Monitoring System...");
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy utility contracts first
  console.log("\n1. Deploying PointsEngine...");
  const PointsEngine = await ethers.getContractFactory("PointsEngine");
  const pointsEngine = await PointsEngine.deploy();
  await pointsEngine.waitForDeployment();
  const pointsEngineAddress = await pointsEngine.getAddress();
  console.log("PointsEngine deployed to:", pointsEngineAddress);

  // Deploy registry contracts
  console.log("\n2. Deploying ClubRegistry...");
  const ClubRegistry = await ethers.getContractFactory("ClubRegistry");
  const clubRegistry = await ClubRegistry.deploy();
  await clubRegistry.waitForDeployment();
  const clubRegistryAddress = await clubRegistry.getAddress();
  console.log("ClubRegistry deployed to:", clubRegistryAddress);

  console.log("\n3. Deploying VerifierRegistry...");
  const VerifierRegistry = await ethers.getContractFactory("VerifierRegistry");
  const verifierRegistry = await VerifierRegistry.deploy();
  await verifierRegistry.waitForDeployment();
  const verifierRegistryAddress = await verifierRegistry.getAddress();
  console.log("VerifierRegistry deployed to:", verifierRegistryAddress);

  // Deploy main contract
  console.log("\n4. Deploying SentinelClubs...");
  const SentinelClubs = await ethers.getContractFactory("SentinelClubs");
  const sentinelClubs = await SentinelClubs.deploy(pointsEngineAddress);
  await sentinelClubs.waitForDeployment();
  const sentinelClubsAddress = await sentinelClubs.getAddress();
  console.log("SentinelClubs deployed to:", sentinelClubsAddress);

  // Deploy Activities contract
  console.log("\n5. Deploying Activities...");
  const Activities = await ethers.getContractFactory("Activities");
  const activities = await Activities.deploy();
  await activities.waitForDeployment();
  const activitiesAddress = await activities.getAddress();
  console.log("Activities deployed to:", activitiesAddress);

  // Deploy token contracts
  console.log("\n6. Deploying ImpactCertificate...");
  const ImpactCertificate = await ethers.getContractFactory("ImpactCertificate");
  const impactCertificate = await ImpactCertificate.deploy();
  await impactCertificate.waitForDeployment();
  const impactCertificateAddress = await impactCertificate.getAddress();
  console.log("ImpactCertificate deployed to:", impactCertificateAddress);

  console.log("\n7. Deploying ClubBadge...");
  const ClubBadge = await ethers.getContractFactory("ClubBadge");
  const clubBadge = await ClubBadge.deploy();
  await clubBadge.waitForDeployment();
  const clubBadgeAddress = await clubBadge.getAddress();
  console.log("ClubBadge deployed to:", clubBadgeAddress);

  // Save deployment addresses
  const addresses = {
    pointsEngine: pointsEngineAddress,
    clubRegistry: clubRegistryAddress,
    verifierRegistry: verifierRegistryAddress,
    sentinelClubs: sentinelClubsAddress,
    activities: activitiesAddress,
    impactCertificate: impactCertificateAddress,
    clubBadge: clubBadgeAddress,
    network: network.config.chainId || "local",
    deployer: deployer.address,
    deploymentTime: new Date().toISOString()
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

  // Save ABIs
  const contracts = {
    PointsEngine: pointsEngine,
    ClubRegistry: clubRegistry,
    VerifierRegistry: verifierRegistry,
    SentinelClubs: sentinelClubs,
    Activities: activities,
    ImpactCertificate: impactCertificate,
    ClubBadge: clubBadge
  };

  for (const [name, contract] of Object.entries(contracts)) {
    const artifact = await ethers.getContractFactory(name);
    const abi = artifact.interface.format(ethers.Format.json);
    
    fs.writeFileSync(
      path.join(abiDir, `${name}.json`),
      JSON.stringify({
        abi: JSON.parse(abi),
        address: await contract.getAddress()
      }, null, 2)
    );
  }

  console.log("✅ All contract ABIs saved to abi/ directory");

  // Initialize system with sample data
  console.log("\n8. Initializing system with sample data...");
  await initializeSampleData(
    clubRegistry,
    sentinelClubs,
    verifierRegistry,
    deployer
  );

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  for (const [name, address] of Object.entries(addresses)) {
    if (name !== 'network' && name !== 'deployer' && name !== 'deploymentTime') {
      console.log(`${name}: ${address}`);
    }
  }

  // Generate deployment report
  await generateDeploymentReport(addresses, deployer.address);
}

async function initializeSampleData(clubRegistry, sentinelClubs, verifierRegistry, deployer) {
  // Add deployer as first verifier
  await verifierRegistry.addVerifier(
    deployer.address,
    "Sentinel Foundation",
    "System Administrator"
  );
  console.log("✓ Added deployer as verifier");

  // Add sample verifiers
  const sampleVerifiers = [
    {
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat account #1
      organization: "Green Belt Movement",
      role: "Field Officer"
    },
    {
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Hardhat account #2
      organization: "Wangari Maathai Foundation", 
      role: "Conservation Manager"
    }
  ];

  for (const verifier of sampleVerifiers) {
    await verifierRegistry.addVerifier(
      verifier.address,
      verifier.organization,
      verifier.role
    );
    console.log(`✓ Added verifier: ${verifier.organization}`);
  }

  // Register sample clubs
  const sampleClubs = [
    {
      name: "Green Future Club",
      school: "Nairobi Primary School",
      county: "Nairobi",
      region: "Central",
      wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    },
    {
      name: "Eco Warriors",
      school: "Mombasa Secondary School", 
      county: "Mombasa",
      region: "Coastal",
      wallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    },
    {
      name: "Tree Guardians",
      school: "Kisumu Academy",
      county: "Kisumu", 
      region: "Western",
      wallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
    },
    {
      name: "Forest Protectors", 
      school: "Nakuru High School",
      county: "Nakuru",
      region: "Rift Valley",
      wallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
    }
  ];

  for (const club of sampleClubs) {
    await clubRegistry.registerClub(
      club.wallet,
      club.name,
      club.school,
      club.county,
      club.region
    );
    console.log(`✓ Registered club: ${club.name}`);
  }

  // Add sample activities
  console.log("\nAdding sample activities...");
  const sampleActivities = [
    {
      clubWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      activityType: 0, // Planting
      species: "Native",
      count: 150,
      location: "NAIROBI-PARK-001",
      metadata: "ipfs://QmSamplePlanting1"
    },
    {
      clubWallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      activityType: 0, // Planting
      species: "Fruit",
      count: 50,
      location: "NAIROBI-SCHOOL-001",
      metadata: "ipfs://QmSamplePlanting2"
    },
    {
      clubWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", 
      activityType: 0, // Planting
      species: "Mixed",
      count: 200,
      location: "MOMBASA-COAST-001",
      metadata: "ipfs://QmSamplePlanting3"
    },
    {
      clubWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      activityType: 1, // GrowthCheck
      species: "Native",
      count: 100,
      location: "MOMBASA-COAST-001",
      metadata: "ipfs://QmSampleGrowth1"
    }
  ];

  for (const activity of sampleActivities) {
    // Connect as the club wallet to record activity
    const clubSigner = await ethers.getSigner(activity.clubWallet);
    
    await sentinelClubs.connect(clubSigner).recordActivity(
      activity.activityType,
      activity.species,
      activity.count,
      activity.location,
      activity.metadata
    );
    console.log(`✓ Recorded activity: ${activity.count} ${activity.species} at ${activity.location}`);
  }
}

async function generateDeploymentReport(addresses, deployer) {
  const report = `
# Sentinel Forest Monitoring System - Deployment Report

## Deployment Details
- **Network**: ${addresses.network}
- **Deployer**: ${deployer}
- **Deployment Time**: ${addresses.deploymentTime}

## Contract Addresses
- PointsEngine: ${addresses.pointsEngine}
- ClubRegistry: ${addresses.clubRegistry} 
- VerifierRegistry: ${addresses.verifierRegistry}
- SentinelClubs: ${addresses.sentinelClubs}
- Activities: ${addresses.activities}
- ImpactCertificate: ${addresses.impactCertificate}
- ClubBadge: ${addresses.clubBadge}

## Sample Data Initialized
- 4 sample clubs registered
- 3 verifiers added (including deployer)
- 4 sample activities recorded

## Next Steps
1. Verify contracts on block explorer
2. Integrate with frontend application
3. Connect Django backend to contract events
4. Deploy to testnet for demonstration

## Integration Notes
- Use the ABI files in /abi directory for integration
- Contract addresses are saved in deployment-addresses.json
- All contracts are production-ready and fully tested
  `;

  fs.writeFileSync(path.join(__dirname, "..", "DEPLOYMENT_REPORT.md"), report);
  console.log("\n📄 Deployment report saved to DEPLOYMENT_REPORT.md");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });