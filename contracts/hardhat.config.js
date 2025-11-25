require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("dotenv").config();

module.exports = {
  paths: {
    sources: "./src",
  },
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true // Better for zkEVM compatibility
    }
  },
  networks: {
    // zkEVM Networks - PRIMARY CHOICE
    polygonZkEVM: {
      url: process.env.POLYGON_ZKEVM_RPC_URL || "https://zkevm-rpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1101,
      gasPrice: 250000000, // 0.25 gwei
      verify: {
        etherscan: {
          apiUrl: "https://api-zkevm.polygonscan.com",
          apiKey: process.env.POLYGON_ZKEVM_API_KEY
        }
      }
    },
    polygonZkEVMTestnet: {
      url: process.env.POLYGON_ZKEVM_TESTNET_RPC_URL || "https://rpc.cardona.zkevm-rpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 2442,
      gasPrice: 250000000,
      verify: {
        etherscan: {
          apiUrl: "https://api-testnet-zkevm.polygonscan.com",
          apiKey: process.env.POLYGON_ZKEVM_API_KEY
        }
      }
    },

    // Other zkEVM Options
    scroll: {
      url: process.env.SCROLL_RPC_URL || "https://scroll-mainnet.public.blastapi.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 534352,
      gasPrice: 100000000 // 0.1 gwei
    },
    scrollSepolia: {
      url: process.env.SCROLL_TESTNET_RPC_URL || "https://sepolia-rpc.scroll.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 534351,
      gasPrice: 100000000
    },
    zkSync: {
      url: process.env.ZKSYNC_RPC_URL || "https://mainnet.era.zksync.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 324,
      verifyURL: "https://zksync2-mainnet-explorer.zksync.io/contract_verification"
    },

    // Fallback networks
    polygon: {
      url: process.env.POLYGON_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
      gasPrice: 300000000000
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.matic.tigris.dev",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001
    }
  },
  etherscan: {
    apiKey: {
      // zkEVM Networks
      polygonZkEVM: process.env.POLYGON_ZKEVM_API_KEY || "",
      polygonZkEVMTestnet: process.env.POLYGON_ZKEVM_API_KEY || "",
      scroll: process.env.SCROLL_API_KEY || "",
      scrollSepolia: process.env.SCROLL_API_KEY || "",
      
      // Traditional networks
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      celo: process.env.CELOSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "polygonZkEVM",
        chainId: 1101,
        urls: {
          apiURL: "https://api-zkevm.polygonscan.com/api",
          browserURL: "https://zkevm.polygonscan.com"
        }
      },
      {
        network: "polygonZkEVMTestnet",
        chainId: 2442,
        urls: {
          apiURL: "https://api-testnet-zkevm.polygonscan.com/api",
          browserURL: "https://testnet-zkevm.polygonscan.com"
        }
      },
      {
        network: "scroll",
        chainId: 534352,
        urls: {
          apiURL: "https://api.scrollscan.com/api",
          browserURL: "https://scrollscan.com"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
    token: "ETH", // zkEVM uses ETH as native token
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice"
  }
};