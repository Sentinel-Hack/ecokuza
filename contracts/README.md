# Sentinel Forest Monitoring - Smart Contracts

## Overview
Sentinel is a blockchain-based platform for monitoring forest conservation activities, focusing on tree planting, growth tracking, and environmental impact verification. The system incentivizes participation through a points system and issues verifiable impact certificates with on-chain data capture.

## Architecture

### Core System Contracts
1. **SentinelClubs** - Main activity tracking contract
2. **PointsEngine** - Points calculation and rewards
3. **ClubRegistry** - Club management
4. **VerifierRegistry** - Verifier management
5. **ImpactCertificate** - NFT certificates (ERC721)

### Data Capture System (NEW)
6. **CertificateData** - On-chain storage for user achievements
7. **APIBridge** - Validates and forwards data from Django backend
8. **OffchainDataHandler** - Manages IPFS/Arweave references

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

## Data Capture System (NEW)

### 6. CertificateData
Stores certificate and tree update data from Django backend.
- Records user certifications with points and tree counts
- Stores tree updates with GPS coordinates
- Maintains IPFS hashes for photos
- Tracks user impact metrics
- **Events**: Emits for certified data capture

**Key Structures:**
```solidity
struct CertificateRecord {
    address userWallet;
    string certificationName;
    uint256 pointsEarned;
    uint256 treeCount;
    uint256 timestamp;
    bool isActive;
}

struct TreeUpdate {
    address userWallet;
    string treeSpecies;
    float latitude;
    float longitude;
    float altitude;
    string photoIPFSHash;
    uint256 authenticity_score;  // 0-100
    string healthAssessment;
    uint256 timestamp;
}

struct UserImpact {
    address userWallet;
    uint256 totalPoints;
    uint256 totalTrees;
    uint256 totalCertifications;
    uint256 lastUpdated;
}
```

### 7. APIBridge
Validates and forwards data from Django backend to CertificateData.
- Verifies ECDSA signatures from backend
- Prevents replay attacks with hash tracking
- Forwards validated data to CertificateData
- Automatically converts GPS coordinates for storage

**Key Features:**
- Signature verification using eth-account library
- Message replay prevention
- 1-hour timestamp window for replay protection

### 8. OffchainDataHandler
Manages IPFS and Arweave references for files.
- Stores IPFS hashes and file metadata
- Stores Arweave transaction IDs
- Manages certificate metadata and badges
- Tracks verification status of off-chain data

**Key Structures:**
```solidity
struct IPFSReference {
    string ipfsHash;
    string contentType;
    uint256 size;
    uint64 uploadTimestamp;
    address uploader;
    bool verified;
}

struct CertificateMetadata {
    string certificateName;
    string description;
    string iconURI;      // IPFS/Arweave URI
    uint256 rarity;      // 0=common, 3=legendary
    string jsonMetadataURI;
}
```

## Data Flow: Django to Blockchain

```
Django TreeRecord Verified
    ↓
    Signal: notify_blockchain_on_tree_verification()
    ↓
    BlockchainService.submit_tree_update()
    - Upload photo to IPFS
    - Sign data with backend key
    - Create transaction payload
    ↓
    APIBridge.submitTreeUpdate()
    - Verify signature
    - Check for replays
    - Forward to CertificateData
    ↓
    CertificateData.recordTreeUpdate()
    - Store tree update record
    - Update user impact metrics
    - Emit TreeUpdateRecorded event
    ↓
    On-Chain: Data persisted with IPFS references
```

## Deployment

### Prerequisites
- Node.js (v16+)
- Hardhat
- A Web3 wallet with testnet ETH (for testnet deployment)

### Environment Variables
Create a `.env` file:
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
npm run compile
```

3. Deploy all contracts with data capture system:
```bash
npm run deploy:certified:local              # Local Hardhat
npm run deploy:certified:mumbai             # Polygon Mumbai
npm run deploy:certified:polygon            # Polygon Mainnet
npm run deploy:certified:zkevm              # Polygon zkEVM
```

4. Verify contracts:
```bash
npx hardhat verify --network polygonZkEVMTestnet DEPLOYED_CONTRACT_ADDRESS "Constructor Argument 1"
```

## Deployment Output

After successful deployment, you'll get addresses for:
- PointsEngine
- ClubRegistry
- VerifierRegistry
- ImpactCertificate
- SentinelClubs
- **CertificateData** (NEW)
- **APIBridge** (NEW)
- **OffchainDataHandler** (NEW)

Addresses are saved to `deployments/{network}-{timestamp}.json` for reference.

## Testing

Run tests:
```bash
npm test
```

## Backend Integration

To integrate with Django:

1. Deploy contracts and save addresses
2. Configure Django with contract addresses and backend signer key
3. Ensure signals are connected in `authentification/signals.py`
4. Install web3.py: `pip install web3 eth-account`
5. Test by verifying a tree record or earning a certification

See `../backend/BLOCKCHAIN_INTEGRATION.md` for detailed setup.

## Security
- All contracts use Solidity 0.8.20 with overflow protection
- Access control using OpenZeppelin's Ownable and AccessControl
- Reentrancy protection for state-changing functions
- ECDSA signature verification for off-chain data
- Events for all important state changes
- Replay attack prevention with hash tracking

## Contract Sizes

| Contract | Size | Status |
|----------|------|--------|
| CertificateData | ~6KB | ✓ Deployed |
| APIBridge | ~8KB | ✓ Deployed |
| OffchainDataHandler | ~7KB | ✓ Deployed |
| SentinelClubs | ~12KB | ✓ Deployed |
| PointsEngine | ~4KB | ✓ Deployed |

All contracts within gas limits for deployment.

## License
MIT

## Directory Structure

```
contracts/
├── src/
│   ├── core/
│   │   ├── SentinelClubs.sol
│   │   ├── PointsEngine.sol
│   │   ├── Activities.sol
│   │   ├── CertificateData.sol        (NEW)
│   │   ├── APIBridge.sol              (NEW)
│   │   └── OffchainDataHandler.sol    (NEW)
│   ├── registry/
│   │   ├── ClubRegistry.sol
│   │   └── VerifierRegistry.sol
│   ├── tokens/
│   │   └── ImpactCertificate.sol
│   ├── interfaces/
│   │   ├── IPointsEngine.sol
│   │   ├── IActivityEvents.sol
│   │   └── ISentinelClubs.sol
│   └── utils/
│       ├── Structs.sol
│       ├── SafeTransfer.sol
│       └── IClubEvents.sol
├── test/
│   └── sentinel.test.js
├── scripts/
│   ├── deploy.js
│   ├── deploy-certified.js            (NEW)
│   └── deploy-zkevm.js
├── deployments/                        (NEW)
│   └── *.json                         (deployment records)
├── package.json
├── hardhat.config.js
└── README.md
```
