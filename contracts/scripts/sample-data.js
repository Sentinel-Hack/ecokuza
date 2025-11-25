const { ethers } = require("hardhat");

async function main() {
  const addresses = require("../abi/deployment-addresses.json");
  
  const SentinelClubs = await ethers.getContractFactory("SentinelClubs");
  const sentinelClubs = SentinelClubs.attach(addresses.sentinelClubs);

  const ClubRegistry = await ethers.getContractFactory("ClubRegistry");
  const clubRegistry = ClubRegistry.attach(addresses.clubRegistry);

  const [deployer] = await ethers.getSigners();

  console.log("Adding sample activities...");

  // Sample activities for different clubs
  const sampleActivities = [
    {
      clubId: 1,
      type: 0, // Planting
      species: "Native",
      count: 150,
      location: "NAIROBI-PARK",
      metadata: "ipfs://QmSample1"
    },
    {
      clubId: 1, 
      type: 0, // Planting
      species: "Fruit",
      count: 50,
      location: "NAIROBI-SCHOOL",
      metadata: "ipfs://QmSample2"
    },
    {
      clubId: 1,
      type: 1, // GrowthCheck
      species: "Native",
      count: 100,
      location: "NAIROBI-PARK",
      metadata: "ipfs://QmSample3"
    },
    {
      clubId: 2,
      type: 0, // Planting
      species: "Mixed",
      count: 200,
      location: "MOMBASA-COAST",
      metadata: "ipfs://QmSample4"
    },
    {
      clubId: 2,
      type: 3, // BiodiversityLog
      species: "Various",
      count: 15,
      location: "MOMBASA-FOREST",
      metadata: "ipfs://QmSample5"
    }
  ];

  for (const activity of sampleActivities) {
    // Get club wallet address
    const club = await clubRegistry.clubs(activity.clubId);
    const clubWallet = new ethers.Wallet(process.env.CLUB_PRIVATE_KEY || ethers.Wallet.createRandom().privateKey);
    
    // For demo purposes, we'll use the deployer to record activities
    // In production, this would be done by the actual club wallets
    await sentinelClubs.connect(deployer).recordActivity(
      activity.type,
      activity.species,
      activity.count,
      activity.location,
      activity.metadata
    );

    console.log(`✓ Recorded activity for Club ${activity.clubId}: ${activity.count} ${activity.species} at ${activity.location}`);
  }

  console.log("\n✅ Sample data added successfully!");

  // Display updated totals
  console.log("\n📈 Updated Club Statistics:");
  for (let i = 1; i < 3; i++) {
    const club = await clubRegistry.clubs(i);
    const activities = await sentinelClubs.getClubActivities(i);
    
    console.log(`\nClub #${i}: ${club.name}`);
    console.log(`  Total Points: ${club.totalPoints}`);
    console.log(`  Total Trees: ${club.totalTrees}`);
    console.log(`  Total Activities: ${activities.length}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });