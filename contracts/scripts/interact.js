const { ethers } = require("hardhat");

async function main() {
  // Load deployed contract addresses
  const addresses = require("../abi/deployment-addresses.json");
  
  // Get contracts
  const ClubRegistry = await ethers.getContractFactory("ClubRegistry");
  const clubRegistry = ClubRegistry.attach(addresses.clubRegistry);

  const SentinelClubs = await ethers.getContractFactory("SentinelClubs");
  const sentinelClubs = SentinelClubs.attach(addresses.sentinelClubs);

  const PointsEngine = await ethers.getContractFactory("PointsEngine");
  const pointsEngine = PointsEngine.attach(addresses.pointsEngine);

  console.log("Connected to contracts on network:", addresses.network);

  // Display current state
  console.log("\n📊 Current System State:");
  
  // Get club count
  const nextClubId = await clubRegistry.nextClubId();
  console.log(`Total Clubs Registered: ${nextClubId - 1}`);

  // Display clubs
  for (let i = 1; i < nextClubId; i++) {
    const club = await clubRegistry.clubs(i);
    console.log(`\nClub #${i}: ${club.name}`);
    console.log(`  School: ${club.schoolName}`);
    console.log(`  County: ${club.county}`);
    console.log(`  Points: ${club.totalPoints}`);
    console.log(`  Trees: ${club.totalTrees}`);
    console.log(`  Active: ${club.active}`);

    // Get club activities
    const activities = await sentinelClubs.getClubActivities(i);
    console.log(`  Activities: ${activities.length}`);
    
    for (const activity of activities) {
      const activityType = ["Planting", "GrowthCheck", "Cleanup", "BiodiversityLog"][activity.activityType];
      console.log(`    - ${activityType}: ${activity.count} ${activity.species} at ${activity.locationCode}`);
    }
  }

  // Display points configuration
  console.log("\n🎯 Points Configuration:");
  const activityTypes = ["Planting", "GrowthCheck", "Cleanup", "BiodiversityLog"];
  for (let i = 0; i < activityTypes.length; i++) {
    const basePoints = await pointsEngine.basePoints(i);
    console.log(`  ${activityTypes[i]}: ${basePoints} base points`);
  }

  // Display species multipliers
  console.log("\n🌿 Species Multipliers:");
  const species = ["Native", "Fruit", "Mixed"];
  for (const specie of species) {
    const multiplier = await pointsEngine.speciesMultiplier(specie);
    console.log(`  ${specie}: ${multiplier / 100}x multiplier`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });