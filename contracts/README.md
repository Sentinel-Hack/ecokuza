# Sentinel Forest Monitoring - Smart Contracts

## Overview
Sentinel is a blockchain-based platform for monitoring forest conservation activities, focusing on tree planting, growth tracking, and environmental impact verification. The system incentivizes participation through a points system and issues verifiable impact certificates.

## Core Contracts

### 1. SentinelClubs
Main contract that manages club activities, tree planting, and growth monitoring.
- Handles activity recording (planting, growth checks, cleanups)
- Tracks species and location statistics
- Integrates with PointsEngine for rewards
- Emits events for off-chain processing

### 2. PointsEngine
Manages the points and rewards system.
- Calculates points based on activity type and species
- Handles verification bonuses
- Manages seasonal leaderboards
- Configurable point parameters

### 3. ImpactCertificate (ERC721)
NFT certificates for verified environmental impact.
- Represents verified tree planting activities
- Includes metadata about the impact (species, location, etc.)
- Tracks certificates per club
- Supports off-chain metadata (IPFS/Arweave)

### 4. ClubRegistry
Manages club registration and profiles.
- Handles club creation and management
- Tracks club membership and activities
- Manages verifier roles

### 5. VerifierRegistry
Manages verifiers who can validate activities.
- Adds/removes verifiers
- Tracks verification history
- Manages verification rewards

## Deployment

### Prerequisites
- Node.js (v16+)
- Hardhat
- A Web3 wallet with testnet ETH (for testnet deployment)

### Environment Variables
Create a `.env` file with the following variables:
```
PRIVATE_KEY=your_private_key
SCROLL_TESTNET_RPC_URL=https://sepolia-rpc.scroll.io
SCROLLSCAN_API_KEY=your_scrollscan_api_key
```

### Deployment Commands

1. Install dependencies:
```bash
npm install
```

2. Compile contracts:
```bash
npx hardhat compile
```

3. Deploy to Scroll Sepolia Testnet:
```bash
npx hardhat run scripts/deploy.js --network scrollSepolia
```

4. Verify contracts:
```bash
npx hardhat verify --network scrollSepolia DEPLOYED_CONTRACT_ADDRESS "Constructor Argument 1"
```

### Deployed Contracts (Scroll Sepolia Testnet)

| Contract | Address |
|----------|---------|
| PointsEngine | [0xfaCC6C825F79D534af3cC9F611511258466290a3](https://sepolia.scrollscan.com/address/0xfaCC6C825F79D534af3cC9F611511258466290a3) |
| ClubRegistry | [0xd7600dE536139605E6541db5d0908862981E157f](https://sepolia.scrollscan.com/address/0xd7600dE536139605E6541db5d0908862981E157f) |
| VerifierRegistry | [0x65806FF71b11b1FCDfaB8ca741b7A7575b666437](https://sepolia.scrollscan.com/address/0x65806FF71b11b1FCDfaB8ca741b7A7575b666437) |
| SentinelClubs | [0xb84622f542DC1071A074CA32E5Cc0F3DDE9aF2eF](https://sepolia.scrollscan.com/address/0xb84622f542DC1071A074CA32E5Cc0F3DDE9aF2eF) |

#### Sample Data Initialized
- Deployer added as a verifier
- 3 sample clubs registered:
  1. Green Future Club (Nairobi Primary School)
  2. Eco Warriors (Mombasa Secondary School)
  3. Tree Guardians (Kisumu Academy)

## Testing

Run tests:
```bash
npx hardhat test
```

## Security
- All contracts use Solidity 0.8.20 with overflow protection
- Access control using OpenZeppelin's Ownable and AccessControl
- Reentrancy protection for state-changing functions
- Events for all important state changes

## License
MIT
