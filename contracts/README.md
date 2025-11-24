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
POLYGON_ZKEVM_RPC_URL=your_polygon_zkevm_rpc_url
POLYGON_ZKEVM_API_KEY=your_polygon_zkevm_scan_api_key
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

3. Deploy to Polygon zkEVM Testnet (Cardona):
```bash
npx hardhat run scripts/deploy-zkevm.js --network polygonZkEVMTestnet
```

4. Verify contracts:
```bash
npx hardhat verify --network polygonZkEVMTestnet DEPLOYED_CONTRACT_ADDRESS "Constructor Argument 1"
```

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
