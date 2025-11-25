const { run } = require("hardhat");

async function main() {
  // Verify all contracts
  console.log("Verifying contracts on Etherscan...");

  const addresses = require("../abi/deployment-addresses.json");
  
  try {
    // Verify PointsEngine
    console.log("Verifying PointsEngine...");
    await run("verify:verify", {
      address: addresses.pointsEngine,
      constructorArguments: [],
    });
    console.log("✓ PointsEngine verified");

    // Verify ClubRegistry
    console.log("Verifying ClubRegistry...");
    await run("verify:verify", {
      address: addresses.clubRegistry,
      constructorArguments: [],
    });
    console.log("✓ ClubRegistry verified");

    // Verify VerifierRegistry
    console.log("Verifying VerifierRegistry...");
    await run("verify:verify", {
      address: addresses.verifierRegistry,
      constructorArguments: [],
    });
    console.log("✓ VerifierRegistry verified");

    // Verify SentinelClubs (has constructor arguments)
    console.log("Verifying SentinelClubs...");
    await run("verify:verify", {
      address: addresses.sentinelClubs,
      constructorArguments: [addresses.pointsEngine],
    });
    console.log("✓ SentinelClubs verified");

    // Verify ImpactCertificate
    console.log("Verifying ImpactCertificate...");
    await run("verify:verify", {
      address: addresses.impactCertificate,
      constructorArguments: [],
    });
    console.log("✓ ImpactCertificate verified");

    // Verify ClubBadge
    console.log("Verifying ClubBadge...");
    await run("verify:verify", {
      address: addresses.clubBadge,
      constructorArguments: [],
    });
    console.log("✓ ClubBadge verified");

    console.log("\n🎉 All contracts verified successfully!");
    
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✓ Contract already verified");
    } else {
      console.error("Verification error:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });