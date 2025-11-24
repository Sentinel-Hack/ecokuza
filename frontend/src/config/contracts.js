export const CONTRACT_ADDRESSES = {
  // Local development addresses (update these after deployment)
  localhost: {
    sentinelClubs: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    pointsEngine: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    impactCertificate: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    clubRegistry: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
  },
  // Add other networks (ropsten, mainnet, etc.) as needed
};

export const SUPPORTED_CHAINS = {
  31337: {
    name: 'localhost',
    rpcUrl: 'http://localhost:8545',
    currency: 'ETH',
    explorer: 'http://localhost:8545',
  },
  // Add other networks here
};

export const DEFAULT_CHAIN_ID = 31337; // localhost
