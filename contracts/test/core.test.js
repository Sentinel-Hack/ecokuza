const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Core Contracts Tests", function () {
  let pointsEngine;
  let clubRegistry;
  let sentinelClubs;
  let owner, club1, verifier1;

  before(async function () {
    [owner, club1, verifier1] = await ethers.getSigners();

    // Deploy PointsEngine
    const PointsEngine = await ethers.getContractFactory("PointsEngine");
    pointsEngine = await PointsEngine.deploy();
    await pointsEngine.waitForDeployment();

    // Deploy ClubRegistry
    const ClubRegistry = await ethers.getContractFactory("ClubRegistry");
    clubRegistry = await ClubRegistry.deploy();
    await clubRegistry.waitForDeployment();

    // Deploy SentinelClubs with the PointsEngine address
    const SentinelClubs = await ethers.getContractFactory("SentinelClubs");
    sentinelClubs = await SentinelClubs.deploy(await pointsEngine.getAddress());
    await sentinelClubs.waitForDeployment();
  });

  it("Should deploy all contracts successfully", async function () {
    expect(await pointsEngine.getAddress()).to.be.properAddress;
    expect(await clubRegistry.getAddress()).to.be.properAddress;
    expect(await sentinelClubs.getAddress()).to.be.properAddress;
  });

  it("Should register a new club", async function () {
    // Register a club using the owner account
    await clubRegistry.connect(owner).registerClub(
      club1.address,
      "Test Club",
      "Test School",
      "Nairobi",
      "Nairobi"
    );

    const club = await clubRegistry.clubs(1);
    expect(club.name).to.equal("Test Club");
    expect(club.schoolName).to.equal("Test School");
    expect(club.county).to.equal("Nairobi");
  });

  it("Should record an activity", async function () {
    // Get a different signer for the second club
    const [,,, club2] = await ethers.getSigners();
    
    // Register a new club with a different wallet using the SentinelClubs contract
    await sentinelClubs.connect(owner).registerClub(
      club2.address,
      "Test Club 2",
      "Test School 2",
      "Nairobi",
      "Nairobi"
    );

    // Get the club ID from the ClubRegistry
    const clubId = await sentinelClubs.clubIdByWallet(club2.address);
    
    // Verify the club is registered
    const club = await sentinelClubs.clubs(clubId);
    expect(club.name).to.equal("Test Club 2");
    expect(club.active).to.be.true;

    // Record a planting activity using the second club's wallet
    await sentinelClubs.connect(club2).recordActivity(
      0, // ActivityType.Planting
      "Acacia",
      10, // count
      "NBI-001", // location code
      "ipfs://test-metadata"
    );

    // Verify the activity was recorded
    const activity = await sentinelClubs.activities(1);
    expect(activity.clubId).to.equal(clubId);
    expect(activity.species).to.equal("Acacia");
    expect(activity.count).to.equal(10);
  });
});
