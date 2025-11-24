const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Sentinel Forest Monitoring System", function () {
  let pointsEngine;
  let clubRegistry;
  let verifierRegistry;
  let sentinelClubs;
  let impactCertificate;
  let clubBadge;

  let owner;
  let clubWallet1, clubWallet2, clubWallet3;
  let verifier1, verifier2;
  let user1, user2;

  beforeEach(async function () {
    [owner, clubWallet1, clubWallet2, clubWallet3, verifier1, verifier2, user1, user2] = await ethers.getSigners();

    // Deploy PointsEngine
    const PointsEngine = await ethers.getContractFactory("PointsEngine");
    pointsEngine = await PointsEngine.deploy();
    await pointsEngine.waitForDeployment();

    // Deploy ClubRegistry
    const ClubRegistry = await ethers.getContractFactory("ClubRegistry");
    clubRegistry = await ClubRegistry.deploy();
    await clubRegistry.waitForDeployment();

    // Deploy VerifierRegistry
    const VerifierRegistry = await ethers.getContractFactory("VerifierRegistry");
    verifierRegistry = await VerifierRegistry.deploy();
    await verifierRegistry.waitForDeployment();

    // Deploy SentinelClubs
    const SentinelClubs = await ethers.getContractFactory("SentinelClubs");
    sentinelClubs = await SentinelClubs.deploy(await pointsEngine.getAddress());
    await sentinelClubs.waitForDeployment();

    // Deploy ImpactCertificate
    const ImpactCertificate = await ethers.getContractFactory("ImpactCertificate");
    impactCertificate = await ImpactCertificate.deploy();
    await impactCertificate.waitForDeployment();

    // Deploy ClubBadge
    const ClubBadge = await ethers.getContractFactory("ClubBadge");
    clubBadge = await ClubBadge.deploy();
    await clubBadge.waitForDeployment();

    // Add verifiers
    await verifierRegistry.addVerifier(verifier1.address, "Green Belt Movement", "Field Officer");
    await verifierRegistry.addVerifier(verifier2.address, "Wangari Maathai Foundation", "Conservation Manager");

    // Register clubs
    await clubRegistry.registerClub(
      clubWallet1.address,
      "Green Future Club",
      "Nairobi Primary School",
      "Nairobi",
      "Central"
    );

    await clubRegistry.registerClub(
      clubWallet2.address,
      "Eco Warriors", 
      "Mombasa Secondary School",
      "Mombasa",
      "Coastal"
    );
  });

  describe("Club Registration", function () {
    it("Should register new clubs correctly", async function () {
      const club = await clubRegistry.clubs(1);
      expect(club.name).to.equal("Green Future Club");
      expect(club.schoolName).to.equal("Nairobi Primary School");
      expect(club.county).to.equal("Nairobi");
      expect(club.active).to.equal(true);
    });

    it("Should prevent duplicate school registration", async function () {
      await expect(
        clubRegistry.registerClub(
          clubWallet3.address,
          "Different Name",
          "Nairobi Primary School", // Same school
          "Nairobi", 
          "Central"
        )
      ).to.be.revertedWith("School already registered");
    });

    it("Should update club status", async function () {
      await clubRegistry.updateClub(1, "Updated Club Name", false);
      const club = await clubRegistry.clubs(1);
      expect(club.name).to.equal("Updated Club Name");
      expect(club.active).to.equal(false);
    });
  });

  describe("Activity Recording", function () {
    it("Should record tree planting activities", async function () {
      await sentinelClubs.connect(clubWallet1).recordActivity(
        0, // ActivityType.Planting
        "Acacia",
        100,
        "NAIROBI-001",
        "ipfs://QmActivity1"
      );

      const activities = await sentinelClubs.getClubActivities(1);
      expect(activities).to.have.lengthOf(1);
      expect(activities[0].species).to.equal("Acacia");
      expect(activities[0].count).to.equal(100);
      expect(activities[0].activityType).to.equal(0); // Planting
    });

    it("Should update club points after activity", async function () {
      const clubBefore = await clubRegistry.clubs(1);
      
      await sentinelClubs.connect(clubWallet1).recordActivity(
        0, // Planting
        "Native",
        50,
        "NAIROBI-002", 
        "ipfs://QmActivity2"
      );

      const clubAfter = await clubRegistry.clubs(1);
      expect(clubAfter.totalPoints).to.be.gt(clubBefore.totalPoints);
      expect(clubAfter.totalTrees).to.equal(50);
    });

    it("Should track species distribution", async function () {
      await sentinelClubs.connect(clubWallet1).recordActivity(
        0, // Planting
        "Acacia",
        30,
        "NAIROBI-001",
        "ipfs://QmActivity3"
      );

      await sentinelClubs.connect(clubWallet1).recordActivity(
        0, // Planting  
        "Mango",
        20,
        "NAIROBI-001",
        "ipfs://QmActivity4"
      );

      const club = await clubRegistry.clubs(1);
      expect(club.totalTrees).to.equal(50);
    });

    it("Should record growth monitoring activities", async function () {
      await sentinelClubs.connect(clubWallet1).recordActivity(
        1, // ActivityType.GrowthCheck
        "Acacia",
        25,
        "NAIROBI-001",
        "ipfs://QmActivity5"
      );

      const activities = await sentinelClubs.getClubActivities(1);
      expect(activities[0].activityType).to.equal(1); // GrowthCheck
    });
  });

  describe("Points System", function () {
    it("Should calculate points for planting native species", async function () {
      const points = await pointsEngine.calculatePoints(0, 100, "Native");
      // Native species have 1.5x multiplier: 10 base points * 100 count * 1.5 = 1500
      expect(points).to.equal(1500);
    });

    it("Should calculate points for growth monitoring", async function () {
      const points = await pointsEngine.calculatePoints(1, 50, "Acacia");
      // GrowthCheck: 5 base points * 50 count * 1.0 = 250
      expect(points).to.equal(250);
    });

    it("Should award bonus points for verification", async function () {
      // First record an activity
      await sentinelClubs.connect(clubWallet1).recordActivity(
        0, // Planting
        "Acacia",
        100,
        "NAIROBI-001",
        "ipfs://QmActivity6"
      );

      const clubBefore = await clubRegistry.clubs(1);
      
      // Verify the activity (first activity has ID 1)
      await sentinelClubs.connect(verifier1).verifyActivity(1, true);

      const clubAfter = await clubRegistry.clubs(1);
      expect(clubAfter.totalPoints).to.be.gt(clubBefore.totalPoints);
    });
  });

  describe("Verification System", function () {
    it("Should allow verifiers to verify activities", async function () {
      await sentinelClubs.connect(clubWallet1).recordActivity(
        0, // Planting
        "Acacia",
        100,
        "NAIROBI-001",
        "ipfs://QmActivity7"
      );

      await sentinelClubs.connect(verifier1).verifyActivity(1, true);
      
      const activity = await sentinelClubs.activities(1);
      expect(activity.verified).to.equal(true);
    });

    it("Should prevent non-verifiers from verifying", async function () {
      await sentinelClubs.connect(clubWallet1).recordActivity(
        0, // Planting
        "Acacia", 
        100,
        "NAIROBI-001",
        "ipfs://QmActivity8"
      );

      await expect(
        sentinelClubs.connect(user1).verifyActivity(1, true)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Impact Certificates", function () {
    it("Should mint impact certificates", async function () {
      await impactCertificate.mintCertificate(
        clubWallet1.address,
        1, // clubId
        500, // trees planted
        "Mixed Native Species",
        "Nairobi County",
        7500, // impact score
        "ipfs://QmCertificate1"
      );

      const balance = await impactCertificate.balanceOf(clubWallet1.address);
      expect(balance).to.equal(1);

      const tokenId = 1;
      const certificateData = await impactCertificate.getCertificateData(tokenId);
      expect(certificateData.treesPlanted).to.equal(500);
      expect(certificateData.clubId).to.equal(1);
    });

    it("Should track club certificates", async function () {
      await impactCertificate.mintCertificate(
        clubWallet1.address,
        1, // clubId
        500,
        "Mixed Native Species", 
        "Nairobi County",
        7500,
        "ipfs://QmCertificate2"
      );

      await impactCertificate.mintCertificate(
        clubWallet1.address,
        1, // same club
        300,
        "Fruit Trees",
        "Nairobi County", 
        4500,
        "ipfs://QmCertificate3"
      );

      const certificates = await impactCertificate.getClubCertificates(1);
      expect(certificates).to.have.lengthOf(2);
    });
  });

  describe("Club Badges", function () {
    it("Should award achievement badges", async function () {
      await clubBadge.awardBadge(1, 0, clubWallet1.address); // Bronze Badge

      const hasBadge = await clubBadge.hasBadge(1, 0);
      expect(hasBadge).to.equal(true);

      const balance = await clubBadge.balanceOf(clubWallet1.address, 0);
      expect(balance).to.equal(1);
    });

    it("Should return all badges for a club", async function () {
      await clubBadge.awardBadge(1, 0, clubWallet1.address); // Bronze
      await clubBadge.awardBadge(1, 3, clubWallet1.address); // Planting Champion

      const badges = await clubBadge.getClubBadges(1);
      expect(badges).to.have.lengthOf(2);
      expect(badges[0]).to.equal(0);
      expect(badges[1]).to.equal(3);
    });
  });

  describe("Location Tracking", function () {
    it("Should track activities by location", async function () {
      await sentinelClubs.connect(clubWallet1).recordActivity(
        0, // Planting
        "Acacia",
        100,
        "NAIROBI-PARK",
        "ipfs://QmLocation1"
      );

      await sentinelClubs.connect(clubWallet2).recordActivity(
        0, // Planting
        "Mango",
        50, 
        "NAIROBI-PARK",
        "ipfs://QmLocation2"
      );

      const locationStats = await sentinelClubs.getLocationStats("NAIROBI-PARK");
      expect(locationStats.totalTrees).to.equal(150);
      expect(locationStats.totalActivities).to.equal(2);
    });
  });
});