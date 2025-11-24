const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Sentinel Forest Monitoring - Comprehensive Tests", function () {
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
    
    // Register test clubs
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
  });

  describe("Contract Deployment", function () {
    it("Should deploy all contracts successfully", async function () {
      expect(await pointsEngine.getAddress()).to.be.properAddress;
      expect(await clubRegistry.getAddress()).to.be.properAddress;
      expect(await sentinelClubs.getAddress()).to.be.properAddress;
      expect(await impactCertificate.getAddress()).to.be.properAddress;
      expect(await clubBadge.getAddress()).to.be.properAddress;
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
      
      const balance = await impactCertificate.balanceOf(club1.address);
      expect(balance).to.equal(1);
      
      const certificate = await impactCertificate.getCertificateData(1);
      expect(certificate.treesPlanted).to.equal(500);
      expect(certificate.clubId).to.equal(1);
    });

    it("Should track club certificates", async function () {
      await impactCertificate.mintCertificate(club1.address, 1, 500, "Species", "Location", 7500, "ipfs://cert2");
      await impactCertificate.mintCertificate(club1.address, 1, 300, "Species", "Location", 4500, "ipfs://cert3");
      
      const certificates = await impactCertificate.getClubCertificates(1);
      expect(certificates).to.have.lengthOf(2);
    });
  });

  describe("Club Badges", function () {
    it("Should award achievement badges", async function () {
      await clubBadge.awardBadge(1, 0, club1.address); // Bronze badge
      
      const hasBadge = await clubBadge.hasBadge(1, 0);
      expect(hasBadge).to.be.true;
      
      const balance = await clubBadge.balanceOf(club1.address, 0);
      expect(balance).to.equal(1);
    });

    it("Should return all badges for a club", async function () {
      await clubBadge.awardBadge(1, 0, club1.address); // Bronze
      await clubBadge.awardBadge(1, 3, club1.address); // Planting Champion
      
      const badges = await clubBadge.getClubBadges(1);
      expect(badges).to.have.lengthOf(2);
      expect(badges).to.include(0);
      expect(badges).to.include(3);
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for activity recording", async function () {
      const tx = await sentinelClubs.connect(club1).recordActivity(0, "Acacia", 100, "LOC-008", "ipfs://test12");
      const receipt = await tx.wait();
      
      expect(receipt.gasUsed).to.be.lt(200000); // Should use less than 200k gas
    });

    it("Should use reasonable gas for club registration", async function () {
      const tx = await clubRegistry.registerClub(club3.address, "Club Three", "School Three", "Kisumu", "Western");
      const receipt = await tx.wait();
      
      expect(receipt.gasUsed).to.be.lt(150000); // Should use less than 150k gas
    });
  });
});