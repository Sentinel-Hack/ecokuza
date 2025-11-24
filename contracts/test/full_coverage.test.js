const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Sentinel Forest Monitoring - Full Test Coverage", function () {
  // Contract instances
  let pointsEngine, clubRegistry, verifierRegistry, sentinelClubs, impactCertificate, clubBadge;
  
  // Test accounts
  let owner, club1, club2, club3, verifier1, verifier2, user1, user2;
  
  // Test data
  const CLUB1_DATA = {
    name: "Green Future Club",
    school: "Nairobi High School",
    county: "Nairobi",
    region: "Nairobi"
  };
  
  const CLUB2_DATA = {
    name: "Eco Warriors",
    school: "Mombasa Academy",
    county: "Mombasa",
    region: "Coast"
  };
  
  const VERIFIER1_DATA = {
    name: "Wangari Maathai Foundation",
    role: "Conservation Expert"
  };
  
  const ACTIVITY_DATA = {
    planting: {
      type: 0, // Planting
      species: "Acacia",
      count: 100,
      location: "NAIROBI-PARK",
      metadata: "ipfs://test-planting-1"
    },
    growthCheck: {
      type: 1, // GrowthCheck
      species: "Acacia",
      count: 80,
      location: "NAIROBI-PARK",
      metadata: "ipfs://test-growth-1"
    },
    cleanup: {
      type: 2, // Cleanup
      species: "N/A",
      count: 5, // bags of trash
      location: "NAIROBI-RIVER",
      metadata: "ipfs://test-cleanup-1"
    },
    biodiversity: {
      type: 3, // BiodiversityLog
      species: "Various",
      count: 3, // species observed
      location: "NAIROBI-PARK",
      metadata: "ipfs://test-biodiversity-1"
    }
  };

  before(async function () {
    [owner, club1, club2, club3, verifier1, verifier2, user1, user2] = await ethers.getSigners();
  });

  beforeEach(async function () {
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

    // Deploy SentinelClubs with PointsEngine
    const SentinelClubs = await ethers.getContractFactory("SentinelClubs");
    sentinelClubs = await SentinelClubs.deploy(pointsEngine.target);
    await sentinelClubs.waitForDeployment();

    // Deploy ImpactCertificate
    const ImpactCertificate = await ethers.getContractFactory("ImpactCertificate");
    impactCertificate = await ImpactCertificate.deploy();
    await impactCertificate.waitForDeployment();

    // Deploy ClubBadge
    const ClubBadge = await ethers.getContractFactory("ClubBadge");
    clubBadge = await ClubBadge.deploy();
    await clubBadge.waitForDeployment();

    // Set up contract dependencies
    await clubRegistry.setSentinelClubs(sentinelClubs.target);
    await verifierRegistry.setSentinelClubs(sentinelClubs.target);
    await sentinelClubs.setRegistries(clubRegistry.target, verifierRegistry.target);
    
    // Grant necessary roles
    await sentinelClubs.grantVerifierRole(verifier1.address);
    await verifierRegistry.addVerifier(verifier1.address, VERIFIER1_DATA.name, VERIFIER1_DATA.role);
    
    // Register test clubs with proper data
    await clubRegistry.connect(club1).registerClub(
      CLUB1_DATA.name,
      CLUB1_DATA.school,
      CLUB1_DATA.county,
      CLUB1_DATA.region
    );
    
    await clubRegistry.connect(club2).registerClub(
      CLUB2_DATA.name,
      CLUB2_DATA.school,
      CLUB2_DATA.county,
      CLUB2_DATA.region
    );
    
    // Add second verifier
    await sentinelClubs.grantVerifierRole(verifier2.address);
    await verifierRegistry.addVerifier(
      verifier2.address, 
      "Green Belt Movement", 
      "Field Officer"
    );
  });

  describe("Contract Deployment", function () {
    it("Should deploy all contracts successfully", async function () {
      expect(await pointsEngine.getAddress()).to.be.properAddress;
      expect(await clubRegistry.getAddress()).to.be.properAddress;
      expect(await verifierRegistry.getAddress()).to.be.properAddress;
      expect(await sentinelClubs.getAddress()).to.be.properAddress;
      expect(await impactCertificate.getAddress()).to.be.properAddress;
      expect(await clubBadge.getAddress()).to.be.properAddress;
    });
    
    it("Should set up initial state correctly", async function () {
      // Verify PointsEngine initialization
      expect(await pointsEngine.owner()).to.equal(owner.address);
      
      // Verify ClubRegistry initialization
      expect(await clubRegistry.sentinelClubs()).to.equal(sentinelClubs.target);
      
      // Verify VerifierRegistry initialization
      expect(await verifierRegistry.sentinelClubs()).to.equal(sentinelClubs.target);
      
      // Verify SentinelClubs initialization
      expect(await sentinelClubs.pointsEngine()).to.equal(pointsEngine.target);
      
      // Verify ImpactCertificate initialization
      expect(await impactCertificate.name()).to.equal("SentinelImpactCertificate");
      expect(await impactCertificate.symbol()).to.equal("SIC");
      
      // Verify ClubBadge initialization
      expect(await clubBadge.owner()).to.equal(owner.address);
    });
  });

  describe("Club Registration", function () {
    it("Should register a new club", async function () {
      const tx = await clubRegistry.connect(club3).registerClub(
        "New Eco Club",
        "Test Academy",
        "Nakuru",
        "Rift Valley"
      );
      
      await expect(tx)
        .to.emit(clubRegistry, "ClubRegistered")
        .withArgs(3, "New Eco Club", "Test Academy");
      
      const club = await clubRegistry.clubs(3);
      expect(club.name).to.equal("New Eco Club");
      expect(club.school).to.equal("Test Academy");
      expect(club.county).to.equal("Nakuru");
      expect(club.region).to.equal("Rift Valley");
      expect(club.totalPoints).to.equal(0);
      expect(club.totalTrees).to.equal(0);
      expect(club.totalActivities).to.equal(0);
      expect(club.active).to.be.true;
      
      // Verify wallet to club ID mapping
      expect(await clubRegistry.clubIdByWallet(club3.address)).to.equal(3);
    });
    
    it("Should not allow duplicate club registration", async function () {
      await expect(
        clubRegistry.connect(club1).registerClub(
          CLUB1_DATA.name,
          CLUB1_DATA.school,
          CLUB1_DATA.county,
          CLUB1_DATA.region
        )
      ).to.be.revertedWith("Club already registered");
    });
    
    it("Should update club information", async function () {
      await clubRegistry.connect(club1).updateClubInfo(
        "Updated Club Name", 
        "Updated School", 
        "Updated County", 
        "Updated Region"
      );
      
      const club = await clubRegistry.clubs(1);
      expect(club.name).to.equal("Updated Club Name");
      expect(club.school).to.equal("Updated School");
      expect(club.county).to.equal("Updated County");
      expect(club.region).to.equal("Updated Region");
      
      // Verify event emission
      await expect(
        clubRegistry.connect(club1).updateClubInfo("New Name", "New School", "New County", "New Region")
      ).to.emit(clubRegistry, "ClubInfoUpdated")
        .withArgs(1, "New Name", "New School", "New County", "New Region");
    });
    
    it("Should not allow non-club members to update info", async function () {
      await expect(
        clubRegistry.connect(user1).updateClubInfo("Hacked", "Hacked", "Hacked", "Hacked")
      ).to.be.revertedWith("Not a registered club");
    });
    
    it("Should deactivate and reactivate clubs", async function () {
      // Deactivate
      await clubRegistry.connect(owner).deactivateClub(1);
      let club = await clubRegistry.clubs(1);
      expect(club.active).to.be.false;
      
      // Try to record activity with inactive club
      await expect(
        sentinelClubs.connect(club1).recordActivity(
          ACTIVITY_DATA.planting.type,
          ACTIVITY_DATA.planting.species,
          ACTIVITY_DATA.planting.count,
          ACTIVITY_DATA.planting.location,
          ACTIVITY_DATA.planting.metadata
        )
      ).to.be.revertedWith("Club inactive");
      
      // Reactivate
      await clubRegistry.connect(owner).activateClub(1);
      club = await clubRegistry.clubs(1);
      expect(club.active).to.be.true;
      
      // Should now be able to record activity
      await sentinelClubs.connect(club1).recordActivity(
        ACTIVITY_DATA.planting.type,
        ACTIVITY_DATA.planting.species,
        ACTIVITY_DATA.planting.count,
        ACTIVITY_DATA.planting.location,
        ACTIVITY_DATA.planting.metadata
      );
      
      const updatedClub = await clubRegistry.clubs(1);
      expect(updatedClub.totalActivities).to.equal(1);
    });
  });

  // ... (previous test cases)

  describe("Activity Recording", function () {
    it("Should record tree planting activities", async function () {
      const tx = await sentinelClubs.connect(club1).recordActivity(
        ACTIVITY_DATA.planting.type,
        ACTIVITY_DATA.planting.species,
        ACTIVITY_DATA.planting.count,
        ACTIVITY_DATA.planting.location,
        ACTIVITY_DATA.planting.metadata
      );
      
      await expect(tx)
        .to.emit(sentinelClubs, "ActivityRecorded")
        .withArgs(1, 1, 0, ACTIVITY_DATA.planting.species, ACTIVITY_DATA.planting.count, ACTIVITY_DATA.planting.location);
      
      const activity = await sentinelClubs.activities(1);
      expect(activity.activityType).to.equal(ACTIVITY_DATA.planting.type);
      expect(activity.species).to.equal(ACTIVITY_DATA.planting.species);
      expect(activity.count).to.equal(ACTIVITY_DATA.planting.count);
      expect(activity.locationCode).to.equal(ACTIVITY_DATA.planting.location);
      expect(activity.metadataURI).to.equal(ACTIVITY_DATA.planting.metadata);
      expect(activity.verified).to.be.false;
      expect(activity.pointsAwarded).to.be.gt(0);
      
      // Verify club activities array was updated
      const clubActivities = await sentinelClubs.getClubActivities(1);
      expect(clubActivities.length).to.equal(1);
      expect(clubActivities[0]).to.equal(1);
      
      // Verify club stats were updated
      const club = await clubRegistry.clubs(1);
      expect(club.totalActivities).to.equal(1);
      expect(club.totalTrees).to.equal(ACTIVITY_DATA.planting.count);
      expect(club.totalPoints).to.equal(activity.pointsAwarded);
      
      // Verify species count was updated
      const speciesCount = await sentinelClubs.clubSpeciesCount(1, ACTIVITY_DATA.planting.species);
      expect(speciesCount).to.equal(ACTIVITY_DATA.planting.count);
      
      // Verify location stats were updated
      const locationStats = await sentinelClubs.locationStats(ACTIVITY_DATA.planting.location);
      expect(locationStats.totalActivities).to.equal(1);
      expect(locationStats.totalTrees).to.equal(ACTIVITY_DATA.planting.count);
    });
    
    it("Should record growth check activities", async function () {
      // First record a planting
      await sentinelClubs.connect(club1).recordActivity(
        ACTIVITY_DATA.planting.type,
        ACTIVITY_DATA.planting.species,
        ACTIVITY_DATA.planting.count,
        ACTIVITY_DATA.planting.location,
        ACTIVITY_DATA.planting.metadata
      );
      
      // Then record a growth check
      await sentinelClubs.connect(club1).recordActivity(
        ACTIVITY_DATA.growthCheck.type,
        ACTIVITY_DATA.growthCheck.species,
        ACTIVITY_DATA.growthCheck.count,
        ACTIVITY_DATA.growthCheck.location,
        ACTIVITY_DATA.growthCheck.metadata
      );
      
      const activity = await sentinelClubs.activities(2);
      expect(activity.activityType).to.equal(ACTIVITY_DATA.growthCheck.type);
      expect(activity.species).to.equal(ACTIVITY_DATA.growthCheck.species);
      expect(activity.count).to.equal(ACTIVITY_DATA.growthCheck.count);
      
      // Verify club stats were updated
      const club = await clubRegistry.clubs(1);
      expect(club.totalActivities).to.equal(2);
      // Growth check shouldn't add to tree count
      expect(club.totalTrees).to.equal(ACTIVITY_DATA.planting.count);
    });
    
    it("Should record cleanup activities", async function () {
      await sentinelClubs.connect(club1).recordActivity(
        ACTIVITY_DATA.cleanup.type,
        ACTIVITY_DATA.cleanup.species,
        ACTIVITY_DATA.cleanup.count,
        ACTIVITY_DATA.cleanup.location,
        ACTIVITY_DATA.cleanup.metadata
      );
      
      const activity = await sentinelClubs.activities(1);
      expect(activity.activityType).to.equal(ACTIVITY_DATA.cleanup.type);
      expect(activity.species).to.equal(ACTIVITY_DATA.cleanup.species);
      expect(activity.count).to.equal(ACTIVITY_DATA.cleanup.count);
      
      // Verify points were awarded
      expect(activity.pointsAwarded).to.be.gt(0);
    });
    
    it("Should record biodiversity log activities", async function () {
      await sentinelClubs.connect(club1).recordActivity(
        ACTIVITY_DATA.biodiversity.type,
        ACTIVITY_DATA.biodiversity.species,
        ACTIVITY_DATA.biodiversity.count,
        ACTIVITY_DATA.biodiversity.location,
        ACTIVITY_DATA.biodiversity.metadata
      );
      
      const activity = await sentinelClubs.activities(1);
      expect(activity.activityType).to.equal(ACTIVITY_DATA.biodiversity.type);
      expect(activity.species).to.equal(ACTIVITY_DATA.biodiversity.species);
      expect(activity.count).to.equal(ACTIVITY_DATA.biodiversity.count);
      
      // Verify points were awarded
      expect(activity.pointsAwarded).to.be.gt(0);
    });
    
    it("Should not allow unregistered clubs to record activities", async function () {
      await expect(
        sentinelClubs.connect(user1).recordActivity(
          ACTIVITY_DATA.planting.type,
          ACTIVITY_DATA.planting.species,
          ACTIVITY_DATA.planting.count,
          ACTIVITY_DATA.planting.location,
          ACTIVITY_DATA.planting.metadata
        )
      ).to.be.revertedWith("Not a registered club");
    });
    
    it("Should not allow zero count activities", async function () {
      await expect(
        sentinelClubs.connect(club1).recordActivity(
          ACTIVITY_DATA.planting.type,
          ACTIVITY_DATA.planting.species,
          0, // Zero count
          ACTIVITY_DATA.planting.location,
          ACTIVITY_DATA.planting.metadata
        )
      ).to.be.revertedWith("Count must be positive");
    });
    
    it("Should not allow empty location", async function () {
      await expect(
        sentinelClubs.connect(club1).recordActivity(
          ACTIVITY_DATA.planting.type,
          ACTIVITY_DATA.planting.species,
          ACTIVITY_DATA.planting.count,
          "", // Empty location
          ACTIVITY_DATA.planting.metadata
        )
      ).to.be.revertedWith("Location required");
    });
  });

  describe("Activity Verification", function () {
    let activityId;

    beforeEach(async function () {
      // Record an activity to be verified
      await sentinelClubs.connect(club1).recordActivity(
        ACTIVITY_DATA.planting.type,
        ACTIVITY_DATA.planting.species,
        ACTIVITY_DATA.planting.count,
        ACTIVITY_DATA.planting.location,
        ACTIVITY_DATA.planting.metadata
      );
      activityId = 1;
    });

    it("Should allow verifiers to verify activities", async function () {
      const tx = await sentinelClubs.connect(verifier1).verifyActivity(activityId, true);
      
      await expect(tx)
        .to.emit(sentinelClubs, "ActivityVerified")
        .withArgs(activityId, true, verifier1.address);
      
      const activity = await sentinelClubs.activities(activityId);
      expect(activity.verified).to.be.true;
      
      // Verify verification was recorded
      const isVerified = await sentinelClubs.isActivityVerifiedBy(activityId, verifier1.address);
      expect(isVerified).to.be.true;
    });
    
    it("Should allow multiple verifiers to verify the same activity", async function () {
      await sentinelClubs.connect(verifier1).verifyActivity(activityId, true);
      await sentinelClubs.connect(verifier2).verifyActivity(activityId, true);
      
      const activity = await sentinelClubs.activities(activityId);
      expect(activity.verified).to.be.true;
      
      // Both verifications should be recorded
      expect(await sentinelClubs.isActivityVerifiedBy(activityId, verifier1.address)).to.be.true;
      expect(await sentinelClubs.isActivityVerifiedBy(activityId, verifier2.address)).to.be.true;
    });
    
    it("Should allow verifiers to reject activities", async function () {
      const tx = await sentinelClubs.connect(verifier1).verifyActivity(activityId, false);
      
      await expect(tx)
        .to.emit(sentinelClubs, "ActivityVerified")
        .withArgs(activityId, false, verifier1.address);
      
      const activity = await sentinelClubs.activities(activityId);
      expect(activity.verified).to.be.false;
    });

    it("Should award bonus points for verified activities", async function () {
      const initialPoints = (await clubRegistry.clubs(1)).totalPoints;
      
      // First verification awards bonus points
      await sentinelClubs.connect(verifier1).verifyActivity(activityId, true);
      
      const afterFirstVerification = (await clubRegistry.clubs(1)).totalPoints;
      expect(afterFirstVerification).to.be.gt(initialPoints);
      
      // Get the activity to check points
      const activity = await sentinelClubs.activities(activityId);
      const basePoints = activity.pointsAwarded;
      
      // Calculate expected bonus (5% of base points)
      const expectedBonus = Math.floor((basePoints * 5) / 100);
      expect(afterFirstVerification - initialPoints).to.equal(expectedBonus);
      
      // Second verification doesn't award additional points
      const beforeSecondVerification = afterFirstVerification;
      await sentinelClubs.connect(verifier2).verifyActivity(activityId, true);
      const afterSecondVerification = (await clubRegistry.clubs(1)).totalPoints;
      
      expect(afterSecondVerification).to.equal(beforeSecondVerification);
    });
    
    it("Should not award points for rejected activities", async function () {
      const initialPoints = (await clubRegistry.clubs(1)).totalPoints;
      
      await sentinelClubs.connect(verifier1).verifyActivity(activityId, false);
      
      const finalPoints = (await clubRegistry.clubs(1)).totalPoints;
      expect(finalPoints).to.equal(initialPoints);
      
      // Activity should not be marked as verified
      const activity = await sentinelClubs.activities(activityId);
      expect(activity.verified).to.be.false;
    });

    it("Should not allow non-verifiers to verify activities", async function () {
      await expect(
        sentinelClubs.connect(user1).verifyActivity(activityId, true)
      ).to.be.revertedWith("Not a verifier");
    });
    
    it("Should not allow verifying non-existent activities", async function () {
      await expect(
        sentinelClubs.connect(verifier1).verifyActivity(999, true)
      ).to.be.revertedWith("Activity does not exist");
    });
    
    it("Should not allow verifying the same activity multiple times by the same verifier", async function () {
      await sentinelClubs.connect(verifier1).verifyActivity(activityId, true);
      
      await expect(
        sentinelClubs.connect(verifier1).verifyActivity(activityId, true)
      ).to.be.revertedWith("Already verified by this verifier");
    });
  });

  describe("Points System", function () {
    it("Should calculate points correctly for different activities", async function () {
      // Test planting points
      await sentinelClubs.connect(club1).recordActivity(
        0, // Planting
        "Acacia",
        100,
        "LOC-001",
        "ipfs://test-planting-2"
      );
      
      const club1Data = await clubRegistry.clubs(1);
      const plantingPoints = club1Data.totalPoints;
      
      // Test growth check points (should be different from planting)
      await sentinelClubs.connect(club1).recordActivity(
        1, // GrowthCheck
        "Acacia",
        100,
        "LOC-001",
        "ipfs://test-growth-2"
      );
      
      const updatedClub1 = await clubRegistry.clubs(1);
      expect(updatedClub1.totalPoints).to.be.gt(plantingPoints);
      
      // Test cleanup points
      await sentinelClubs.connect(club1).recordActivity(
        2, // Cleanup
        "N/A",
        5, // 5 bags of trash
        "LOC-001",
        "ipfs://test-cleanup-1"
      );
      
      // Test biodiversity log points
      await sentinelClubs.connect(club1).recordActivity(
        3, // BiodiversityLog
        "Various",
        3, // 3 species observed
        "LOC-001",
        "ipfs://test-biodiversity-1"
      );
      
      const finalClub = await clubRegistry.clubs(1);
      expect(finalClub.totalPoints).to.be.gt(updatedClub1.totalPoints);
    });

    it("Should apply species multipliers correctly", async function () {
      // Test with native species (should have higher multiplier)
      await sentinelClubs.connect(club1).recordActivity(
        0, // Planting
        "Native",
        100,
        "LOC-002",
        "ipfs://test-native-planting"
      );
      
      const nativePoints = (await clubRegistry.clubs(1)).totalPoints;
      
      // Test with non-native species
      await sentinelClubs.connect(club2).recordActivity(
        0, // Planting
        "Eucalyptus",
        100,
        "LOC-003",
        "ipfs://test-eucalyptus-planting"
      );
      
      const nonNativePoints = (await clubRegistry.clubs(2)).totalPoints;
      
      // Native species should give more points due to higher multiplier
      expect(nativePoints).to.be.gt(nonNativePoints);
    });
    
    it("Should calculate verification bonus correctly", async function () {
      // Record an activity
      await sentinelClubs.connect(club1).recordActivity(
        ACTIVITY_DATA.planting.type,
        ACTIVITY_DATA.planting.species,
        ACTIVITY_DATA.planting.count,
        ACTIVITY_DATA.planting.location,
        ACTIVITY_DATA.planting.metadata
      );
      
      const initialPoints = (await clubRegistry.clubs(1)).totalPoints;
      
      // Verify the activity
      await sentinelClubs.connect(verifier1).verifyActivity(1, true);
      
      const afterVerification = (await clubRegistry.clubs(1)).totalPoints;
      const bonusPoints = afterVerification - initialPoints;
      
      // Verify the bonus is calculated correctly (base points * count * bonus percentage)
      const expectedBonus = Math.floor((ACTIVITY_DATA.planting.count * 10 * 5) / 100); // 5% of base points (10 per tree)
      expect(bonusPoints).to.equal(expectedBonus);
    });
    
    it("Should handle points calculation for large numbers", async function () {
      const LARGE_NUMBER = 1000000;
      
      await sentinelClubs.connect(club1).recordActivity(
        0, // Planting
        "Acacia",
        LARGE_NUMBER,
        "LARGE-SITE",
        "ipfs://large-planting"
      );
      
      const club = await clubRegistry.clubs(1);
      expect(club.totalPoints).to.be.gt(0);
      expect(club.totalPoints).to.equal(LARGE_NUMBER * 10); // 10 points per tree
    });
  });

  describe("Impact Certificates", function () {
    let activityId;
    
    beforeEach(async function () {
      // Record and verify an activity
      await sentinelClubs.connect(club1).recordActivity(
        ACTIVITY_DATA.planting.type,
        ACTIVITY_DATA.planting.species,
        ACTIVITY_DATA.planting.count,
        ACTIVITY_DATA.planting.location,
        ACTIVITY_DATA.planting.metadata
      );
      
      activityId = 1;
      await sentinelClubs.connect(verifier1).verifyActivity(activityId, true);
    });
    
    it("Should mint impact certificates for verified activities", async function () {
      const activity = await sentinelClubs.activities(activityId);
      const impactScore = await pointsEngine.calculatePoints(
        activity.activityType,
        activity.count,
        activity.species
      );
      
      const tx = await impactCertificate.mintCertificate(
        club1.address,
        activity.clubId,
        activity.count,
        activity.species,
        activity.locationCode,
        impactScore,
        activity.metadataURI
      );
      
      await expect(tx)
        .to.emit(impactCertificate, "CertificateMinted")
        .withArgs(1, activity.clubId, activity.count, impactScore, activity.metadataURI);
      
      const certificate = await impactCertificate.certificateData(1);
      expect(certificate.clubId).to.equal(activity.clubId);
      expect(certificate.treesPlanted).to.equal(activity.count);
      expect(certificate.species).to.equal(activity.species);
      expect(certificate.location).to.equal(activity.locationCode);
      expect(certificate.impactScore).to.equal(impactScore);
      expect(certificate.issueDate).to.be.gt(0);
      expect(certificate.metadataURI).to.equal(activity.metadataURI);
      
      // Check ownership
      expect(await impactCertificate.ownerOf(1)).to.equal(club1.address);
      
      // Check balance
      expect(await impactCertificate.balanceOf(club1.address)).to.equal(1);
    });
    
    it("Should track certificates per club", async function () {
      // Mint first certificate
      let activity = await sentinelClubs.activities(activityId);
      let impactScore = await pointsEngine.calculatePoints(
        activity.activityType,
        activity.count,
        activity.species
      );
      
      await impactCertificate.mintCertificate(
        club1.address,
        activity.clubId,
        activity.count,
        activity.species,
        activity.locationCode,
        impactScore,
        activity.metadataURI
      );
      
      // Record and verify another activity
      await sentinelClubs.connect(club1).recordActivity(
        ACTIVITY_DATA.planting.type,
        "Neem",
        50,
        "NAIROBI-SCHOOL",
        "ipfs://test-planting-3"
      );
      
      await sentinelClubs.connect(verifier1).verifyActivity(2, true);
      
      activity = await sentinelClubs.activities(2);
      impactScore = await pointsEngine.calculatePoints(
        activity.activityType,
        activity.count,
        activity.species
      );
      
      // Mint second certificate for the same club
      await impactCertificate.mintCertificate(
        club1.address,
        activity.clubId,
        activity.count,
        activity.species,
        activity.locationCode,
        impactScore,
        activity.metadataURI
      );
      
      // Get club certificates
      const certificateIds = await impactCertificate.getClubCertificates(activity.clubId);
      expect(certificateIds).to.have.lengthOf(2);
      expect(certificateIds[0]).to.equal(1);
      expect(certificateIds[1]).to.equal(2);
      
      // Verify certificate details
      const cert1 = await impactCertificate.certificateData(1);
      const cert2 = await impactCertificate.certificateData(2);
      
      expect(cert1.species).to.equal("Acacia");
      expect(cert2.species).to.equal("Neem");
      expect(cert1.impactScore).to.be.gt(0);
      expect(cert2.impactScore).to.be.gt(0);
    });
    
    it("Should not allow minting for unverified activities", async function () {
      // Record but don't verify this activity
      await sentinelClubs.connect(club2).recordActivity(
        ACTIVITY_DATA.planting.type,
        ACTIVITY_DATA.planting.species,
        ACTIVITY_DATA.planting.count,
        ACTIVITY_DATA.planting.location,
        ACTIVITY_DATA.planting.metadata
      );
      
      const activity = await sentinelClubs.activities(2);
      const impactScore = await pointsEngine.calculatePoints(
        activity.activityType,
        activity.count,
        activity.species
      );
      
      await expect(
        impactCertificate.mintCertificate(
          club2.address,
          activity.clubId,
          activity.count,
          activity.species,
          activity.locationCode,
          impactScore,
          activity.metadataURI
        )
      ).to.be.revertedWith("Activity not verified");
    });
    
    it("Should return token URI for certificates", async function () {
      const activity = await sentinelClubs.activities(activityId);
      const impactScore = await pointsEngine.calculatePoints(
        activity.activityType,
        activity.count,
        activity.species
      );
      
      await impactCertificate.mintCertificate(
        club1.address,
        activity.clubId,
        activity.count,
        activity.species,
        activity.locationCode,
        impactScore,
        activity.metadataURI
      );
      
      const tokenURI = await impactCertificate.tokenURI(1);
      expect(tokenURI).to.equal(activity.metadataURI);
    });
    
    it("Should not allow minting with invalid club ID", async function () {
      const activity = await sentinelClubs.activities(activityId);
      const impactScore = await pointsEngine.calculatePoints(
        activity.activityType,
        activity.count,
        activity.species
      );
      
      await expect(
        impactCertificate.mintCertificate(
          club1.address,
          999, // Invalid club ID
          activity.count,
          activity.species,
          activity.locationCode,
          impactScore,
          activity.metadataURI
        )
      ).to.be.revertedWith("Invalid club ID");
    });
    
    it("Should not allow minting with zero trees", async function () {
      const activity = await sentinelClubs.activities(activityId);
      const impactScore = await pointsEngine.calculatePoints(
        activity.activityType,
        activity.count,
        activity.species
      );
      
      await expect(
        impactCertificate.mintCertificate(
          club1.address,
          activity.clubId,
          0, // Zero trees
          activity.species,
          activity.locationCode,
          impactScore,
          activity.metadataURI
        )
      ).to.be.revertedWith("Must plant at least one tree");
    });
    
    it("Should allow transferring certificates", async function () {
      // Mint a certificate
      const activity = await sentinelClubs.activities(activityId);
      const impactScore = await pointsEngine.calculatePoints(
        activity.activityType,
        activity.count,
        activity.species
      );
      
      await impactCertificate.mintCertificate(
        club1.address,
        activity.clubId,
        activity.count,
        activity.species,
        activity.locationCode,
        impactScore,
        activity.metadataURI
      );
      
      // Transfer to another address
      await impactCertificate.connect(club1).transferFrom(club1.address, user1.address, 1);
      
      // Check new owner
      expect(await impactCertificate.ownerOf(1)).to.equal(user1.address);
      
      // Check that the certificate is still associated with the original club
      const certificate = await impactCertificate.certificateData(1);
      expect(certificate.clubId).to.equal(activity.clubId);
      
      // Verify the certificate is still in the club's certificate list
      const clubCertificates = await impactCertificate.getClubCertificates(activity.clubId);
      expect(clubCertificates).to.include(1);
    });
  });

  describe("Club Badges", function () {
    const BADGE_TYPES = {
      BRONZE: 0,
      SILVER: 1,
      GOLD: 2,
      PLANTING_CHAMPION: 3,
      CONSERVATION_LEADER: 4,
      BIODIVERSITY_EXPERT: 5
    };
    
    it("Should award achievement badges", async function () {
      const tx = await clubBadge.awardBadge(1, BADGE_TYPES.BRONZE, club1.address);
      
      await expect(tx)
        .to.emit(clubBadge, "BadgeAwarded")
        .withArgs(1, BADGE_TYPES.BRONZE, club1.address);
      
      const hasBadge = await clubBadge.hasBadge(1, BADGE_TYPES.BRONZE);
      expect(hasBadge).to.be.true;
      
      const balance = await clubBadge.balanceOf(club1.address, BADGE_TYPES.BRONZE);
      expect(balance).to.equal(1);
      
      // Check badge details
      const badgeDetails = await clubBadge.badgeDetails(1, BADGE_TYPES.BRONZE);
      expect(badgeDetails.awarded).to.be.true;
      expect(badgeDetails.timestamp).to.be.gt(0);
    });
    
    it("Should return all badges for a club", async function () {
      // Award multiple badges
      await clubBadge.awardBadge(1, BADGE_TYPES.BRONZE, club1.address);
      await clubBadge.awardBadge(1, BADGE_TYPES.PLANTING_CHAMPION, club1.address);
      
      const badges = await clubBadge.getClubBadges(1);
      expect(badges).to.have.lengthOf(2);
      expect(badges).to.include(BADGE_TYPES.BRONZE);
      expect(badges).to.include(BADGE_TYPES.PLANTING_CHAMPION);
      
      // Verify badge details
      const badge1 = await clubBadge.badgeDetails(1, BADGE_TYPES.BRONZE);
      expect(badge1.awarded).to.be.true;
      expect(badge1.timestamp).to.be.gt(0);
      
      const badge2 = await clubBadge.badgeDetails(1, BADGE_TYPES.PLANTING_CHAMPION);
      expect(badge2.awarded).to.be.true;
      expect(badge2.timestamp).to.be.gt(0);
    });
    
    it("Should not allow awarding the same badge twice", async function () {
      await clubBadge.awardBadge(1, BADGE_TYPES.BRONZE, club1.address);
      
      await expect(
        clubBadge.awardBadge(1, BADGE_TYPES.BRONZE, club1.address)
      ).to.be.revertedWith("Badge already awarded");
    });
    
    it("Should allow different clubs to have the same badge", async function () {
      await clubBadge.awardBadge(1, BADGE_TYPES.BRONZE, club1.address);
      await clubBadge.awardBadge(2, BADGE_TYPES.BRONZE, club2.address);
      
      const club1HasBadge = await clubBadge.hasBadge(1, BADGE_TYPES.BRONZE);
      const club2HasBadge = await clubBadge.hasBadge(2, BADGE_TYPES.BRONZE);
      
      expect(club1HasBadge).to.be.true;
      expect(club2HasBadge).to.be.true;
    });
    
    it("Should not allow non-owners to award badges", async function () {
      await expect(
        clubBadge.connect(user1).awardBadge(1, BADGE_TYPES.BRONZE, club1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Should return correct badge URIs", async function () {
      // Default URI for non-existent badges
      let uri = await clubBadge.uri(BADGE_TYPES.BRONZE);
      expect(uri).to.equal(""); // Default empty string
      
      // Set base URI
      const BASE_URI = "ipfs://badges/";
      await clubBadge.setBaseURI(BASE_URI);
      
      // Check URI after setting base
      uri = await clubBadge.uri(BADGE_TYPES.BRONZE);
      expect(uri).to.equal(`${BASE_URI}${BADGE_TYPES.BRONZE}`);
      
      // Award badge and check token URI
      await clubBadge.awardBadge(1, BADGE_TYPES.BRONZE, club1.address);
      const tokenId = await clubBadge.tokenOfOwnerByIndex(club1.address, 0);
      const tokenURI = await clubBadge.tokenURI(tokenId);
      
      expect(tokenURI).to.equal(`${BASE_URI}${BADGE_TYPES.BRONZE}`);
    });
    
    it("Should support batch operations", async function () {
      // Award multiple badges in a batch
      const clubIds = [1, 2];
      const badgeTypes = [BADGE_TYPES.BRONZE, BADGE_TYPES.SILVER];
      const recipients = [club1.address, club2.address];
      
      await clubBadge.awardBadges(clubIds, badgeTypes, recipients);
      
      // Verify badges were awarded
      expect(await clubBadge.hasBadge(1, BADGE_TYPES.BRONZE)).to.be.true;
      expect(await clubBadge.hasBadge(2, BADGE_TYPES.SILVER)).to.be.true;
      
      // Check balances
      expect(await clubBadge.balanceOf(club1.address, BADGE_TYPES.BRONZE)).to.equal(1);
      expect(await clubBadge.balanceOf(club2.address, BADGE_TYPES.SILVER)).to.equal(1);
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for activity recording", async function () {
      const tx = await sentinelClubs.connect(club1).recordActivity(
        ACTIVITY_DATA.planting.type,
        ACTIVITY_DATA.planting.species,
        ACTIVITY_DATA.planting.count,
        ACTIVITY_DATA.planting.location,
        ACTIVITY_DATA.planting.metadata
      );
      
      const receipt = await tx.wait();
      console.log(`Activity recording gas used: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lt(250000); // Should use less than 250k gas
    });
    
    it("Should use reasonable gas for activity verification", async function () {
      // Record an activity first
      await sentinelClubs.connect(club1).recordActivity(
        ACTIVITY_DATA.planting.type,
        ACTIVITY_DATA.planting.species,
        ACTIVITY_DATA.planting.count,
        ACTIVITY_DATA.planting.location,
        ACTIVITY_DATA.planting.metadata
      );
      
      const tx = await sentinelClubs.connect(verifier1).verifyActivity(1, true);
      const receipt = await tx.wait();
      console.log(`Activity verification gas used: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lt(150000); // Should use less than 150k gas
    });

    it("Should use reasonable gas for club registration", async function () {
      const tx = await clubRegistry.connect(club3).registerClub(
        "Gas Test Club",
        "Gas Test School",
        "Test County",
        "Test Region"
      );
      
      const receipt = await tx.wait();
      console.log(`Club registration gas used: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lt(200000); // Should use less than 200k gas
    });
    
    it("Should use reasonable gas for certificate minting", async function () {
      // Record and verify an activity first
      await sentinelClubs.connect(club1).recordActivity(
        ACTIVITY_DATA.planting.type,
        ACTIVITY_DATA.planting.species,
        ACTIVITY_DATA.planting.count,
        ACTIVITY_DATA.planting.location,
        ACTIVITY_DATA.planting.metadata
      );
      
      await sentinelClubs.connect(verifier1).verifyActivity(1, true);
      
      const activity = await sentinelClubs.activities(1);
      const impactScore = await pointsEngine.calculatePoints(
        activity.activityType,
        activity.count,
        activity.species
      );
      
      const tx = await impactCertificate.mintCertificate(
        club1.address,
        activity.clubId,
        activity.count,
        activity.species,
        activity.locationCode,
        impactScore,
        activity.metadataURI
      );
      
      const receipt = await tx.wait();
      console.log(`Certificate minting gas used: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lt(300000); // Should use less than 300k gas
    });
  });
  
  describe("Edge Cases", function () {
    it("Should handle maximum values correctly", async function () {
      const MAX_UINT32 = 2**32 - 1;
      
      // Test with maximum values
      await sentinelClubs.connect(club1).recordActivity(
        0, // Planting
        "Acacia",
        MAX_UINT32,
        "MAX-LOCATION",
        "ipfs://max-test"
      );
      
      const club = await clubRegistry.clubs(1);
      expect(club.totalTrees).to.equal(MAX_UINT32);
      
      // Verify the activity
      await sentinelClubs.connect(verifier1).verifyActivity(1, true);
      
      // Mint certificate with maximum values
      const activity = await sentinelClubs.activities(1);
      const impactScore = await pointsEngine.calculatePoints(
        activity.activityType,
        activity.count,
        activity.species
      );
      
      await impactCertificate.mintCertificate(
        club1.address,
        activity.clubId,
        activity.count,
        activity.species,
        activity.locationCode,
        impactScore,
        activity.metadataURI
      );
      
      // Verify certificate data
      const certificate = await impactCertificate.certificateData(1);
      expect(certificate.treesPlanted).to.equal(MAX_UINT32);
    });
    
    it("Should handle multiple activities in quick succession", async function () {
      const BATCH_SIZE = 10;
      
      for (let i = 0; i < BATCH_SIZE; i++) {
        await sentinelClubs.connect(club1).recordActivity(
          0, // Planting
          `Species-${i}`,
          10,
          `LOC-${i}`,
          `ipfs://batch-test-${i}`
        );
        
        // Verify every other activity
        if (i % 2 === 0) {
          await sentinelClubs.connect(verifier1).verifyActivity(i + 1, true);
        }
      }
      
      const club = await clubRegistry.clubs(1);
      expect(club.totalActivities).to.equal(BATCH_SIZE);
      expect(club.totalTrees).to.equal(BATCH_SIZE * 10);
      
      // Verify all activities were recorded
      const activities = [];
      for (let i = 1; i <= BATCH_SIZE; i++) {
        activities.push(await sentinelClubs.activities(i));
      }
      
      expect(activities).to.have.lengthOf(BATCH_SIZE);
      expect(activities[0].species).to.equal("Species-0");
      expect(activities[BATCH_SIZE - 1].species).to.equal(`Species-${BATCH_SIZE - 1}`);
      
      // Verify some activities are verified and some are not
      const verifiedActivities = activities.filter(a => a.verified);
      const unverifiedActivities = activities.filter(a => !a.verified);
      
      expect(verifiedActivities.length).to.be.greaterThan(0);
      expect(unverifiedActivities.length).to.be.greaterThan(0);
    });
    
    it("Should handle concurrent operations from different clubs", async function () {
      // Simulate concurrent operations by interleaving calls from different clubs
      const CLUB_COUNT = 3;
      const ACTIVITIES_PER_CLUB = 3;
      
      const clubs = [club1, club2, club3];
      const promises = [];
      
      // Register club3 if not already registered
      if (!(await clubRegistry.clubIdByWallet(club3.address))) {
        await clubRegistry.connect(club3).registerClub(
          "Concurrent Test Club",
          "Test School",
          "Test County",
          "Test Region"
        );
      }
      
      for (let clubId = 0; clubId < CLUB_COUNT; clubId++) {
        for (let i = 0; i < ACTIVITIES_PER_CLUB; i++) {
          promises.push(
            sentinelClubs.connect(clubs[clubId]).recordActivity(
              0, // Planting
              `Species-${clubId}-${i}`,
              5,
              `LOC-${clubId}-${i}`,
              `ipfs://concurrent-${clubId}-${i}`
            )
          );
        }
      }
      
      // Execute all operations
      await Promise.all(promises);
      
      // Verify all activities were recorded
      for (let clubId = 1; clubId <= CLUB_COUNT; clubId++) {
        const club = await clubRegistry.clubs(clubId);
        expect(club.totalActivities).to.equal(ACTIVITIES_PER_CLUB);
        expect(club.totalTrees).to.equal(ACTIVITIES_PER_CLUB * 5);
        
        // Verify activities
        const activities = [];
        for (let i = 1; i <= CLUB_COUNT * ACTIVITIES_PER_CLUB; i++) {
          const activity = await sentinelClubs.activities(i);
          if (activity.clubId.toNumber() === clubId) {
            activities.push(activity);
          }
        }
        
        expect(activities).to.have.lengthOf(ACTIVITIES_PER_CLUB);
      }
    });
    
    it("Should handle large numbers of activities efficiently", async function () {
      // This test might take a while to run, so we'll use a smaller number in the test suite
      // Increase this number for more thorough testing
      const NUM_ACTIVITIES = 10;
      
      // Record multiple activities
      for (let i = 0; i < NUM_ACTIVITIES; i++) {
        await sentinelClubs.connect(club1).recordActivity(
          i % 4, // Cycle through activity types
          `Species-${i}`,
          (i % 5) + 1, // 1-5
          `LOC-${i % 3}`, // 3 different locations
          `ipfs://stress-test-${i}`
        );
        
        // Verify every third activity
        if (i % 3 === 0) {
          await sentinelClubs.connect(verifier1).verifyActivity(i + 1, true);
        }
      }
      
      // Verify final state
      const club = await clubRegistry.clubs(1);
      expect(club.totalActivities).to.equal(NUM_ACTIVITIES);
      
      // Calculate expected tree count (only planting activities add to tree count)
      const expectedTreeCount = Math.ceil(NUM_ACTIVITIES / 4) * 3; // Rough estimate
      expect(club.totalTrees).to.be.greaterThan(0);
      
      // Verify activities can be retrieved
      const activities = [];
      for (let i = 1; i <= NUM_ACTIVITIES; i++) {
        activities.push(await sentinelClubs.activities(i));
      }
      
      expect(activities).to.have.lengthOf(NUM_ACTIVITIES);
      
      // Verify some activities are verified and some are not
      const verifiedActivities = activities.filter(a => a.verified);
      const unverifiedActivities = activities.filter(a => !a.verified);
      
      expect(verifiedActivities.length).to.be.greaterThan(0);
      expect(unverifiedActivities.length).to.be.greaterThan(0);
    });
  });
});
