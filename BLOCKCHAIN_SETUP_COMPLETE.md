# Blockchain Integration - Complete Setup Guide

## What Was Built

A complete blockchain data capture system that automatically syncs Django records to the blockchain:

1. **Three New Smart Contracts:**
   - `CertificateData.sol` - Stores user certifications, tree updates, GPS, and IPFS photo hashes
   - `APIBridge.sol` - Validates signatures from Django backend and forwards data
   - `OffchainDataHandler.sol` - Manages IPFS/Arweave references and metadata

2. **Django Backend Integration:**
   - `blockchain_service.py` - Signs and submits data to blockchain
   - `blockchain_config.py` - Configuration for blockchain addresses and RPC
   - Signal handlers in `authentification/signals.py` - Automatically syncs when data is verified

3. **Documentation:**
   - `backend/BLOCKCHAIN_INTEGRATION.md` - Detailed integration guide
   - `contracts/README.md` - Updated with new contract documentation
   - `deployments/` folder - Stores deployment addresses

## Quick Start

### 1. Deploy Contracts

```bash
cd contracts
npm install
npm run compile
npm run deploy:certified:mumbai  # or your chosen network (polygon, zkevm, local)
```

**Output:** You'll get a deployment JSON with contract addresses:
- `certificateData`
- `apiBridge`
- `offchainDataHandler`
- Plus existing contracts

### 2. Configure Django

Add to your `.env` file:

```env
# Blockchain RPC
BLOCKCHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com
# or Polygon: https://polygon-rpc.com
# or zkEVM: https://rpc.cardona.zkevm-testnet.com
# or local: http://localhost:8545

# From deployment step above
BLOCKCHAIN_CERTIFICATES_DATA_ADDRESS=0x...
BLOCKCHAIN_API_BRIDGE_ADDRESS=0x...
BLOCKCHAIN_OFFCHAIN_DATA_HANDLER_ADDRESS=0x...

# Backend signer private key (the account that signs data)
# This should be an account with some test ETH for gas
BLOCKCHAIN_SIGNER_PRIVATE_KEY=your_private_key_hex_without_0x

# Enable the feature
BLOCKCHAIN_ENABLED=true

# IPFS (for uploading photos)
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
PINATA_API_KEY=your_key
PINATA_API_SECRET=your_secret
```

### 3. Install Dependencies

```bash
cd backend
pip install web3 eth-account
```

### 4. Test It

**Option A: Command Line Test**
```bash
python manage.py shell

from authentification.models import UserCertification, Certification, CustomUser
user = CustomUser.objects.first()
cert = Certification.objects.first()

# This will trigger the signal and sync to blockchain
uc = UserCertification.objects.create(user=user, certification=cert)
# Check console output for blockchain sync confirmation
```

**Option B: UI Test**
1. Run Django: `python manage.py runserver`
2. Go to admin panel
3. Create or verify a tree record
4. Watch logs for blockchain sync message

## How It Works

### Data Flow: Tree Verification

```
Step 1: Admin verifies tree record in Django
        ↓
Step 2: Django signal fires: notify_blockchain_on_tree_verification()
        ↓
Step 3: blockchain_service.submit_tree_update() called with:
        - user_wallet (derived from user ID)
        - tree species, GPS coords
        - photo (uploaded to IPFS)
        - authenticity score
        ↓
Step 4: Data signed with BLOCKCHAIN_SIGNER_PRIVATE_KEY
        ↓
Step 5: Signature + data sent to APIBridge.submitTreeUpdate()
        ↓
Step 6: Smart contract verifies signature (prevents tampering)
        ↓
Step 7: CertificateData contract stores record with:
        - User wallet
        - Tree species
        - GPS (latitude, longitude, altitude)
        - IPFS hash of photo
        - AI authenticity score
        ↓
Step 8: Event emitted for off-chain indexing (The Graph, etc.)
        ↓
Step 9: On-chain data persisted forever ✅
```

### Data Flow: Certification Earned

```
User earns certification
        ↓
Django creates UserCertification record
        ↓
Signal fires: notify_blockchain_on_certification()
        ↓
blockchain_service.submit_certification() called with:
        - certification name
        - points earned
        - number of verified trees
        ↓
Data signed and sent to APIBridge.submitCertificate()
        ↓
CertificateData records achievement
        ↓
On-chain achievement stored with timestamp ✅
```

## On-Chain Data Structure

### TreeUpdate Record
```
{
  userWallet: "0x123...",          // User's blockchain address
  treeSpecies: "Acacia",           // Tree species
  latitude: -1.2345,               // GPS latitude
  longitude: 36.7890,              // GPS longitude
  altitude: 1850,                  // Altitude in meters
  photoIPFSHash: "Qm...",         // IPFS hash of tree photo
  authenticity_score: 95,          // AI confidence: 0-100
  healthAssessment: "Good",        // Health status
  timestamp: 1732021820           // Unix timestamp
}
```

### CertificateRecord
```
{
  userWallet: "0x123...",
  certificationName: "Bronze Planter",
  pointsEarned: 500,
  treeCount: 10,
  timestamp: 1732021820,
  isActive: true
}
```

## Key Features

✅ **Automatic**: Signals automatically sync when records are verified
✅ **Signed**: All data cryptographically signed to prevent tampering
✅ **Verified**: On-chain signature verification prevents unauthorized data
✅ **Immutable**: Once on blockchain, records cannot be modified
✅ **Transparent**: All data queryable via blockchain explorer
✅ **Decentralized**: No single point of failure
✅ **IPFS**: Photos stored on decentralized storage
✅ **Verifiable**: Anyone can verify the data

## File Changes Summary

### New Files Created
- `backend/blockchain_service.py` - Service for blockchain interaction
- `backend/blockchain_config.py` - Configuration
- `backend/BLOCKCHAIN_INTEGRATION.md` - Integration guide
- `contracts/src/core/CertificateData.sol` - On-chain storage
- `contracts/src/core/APIBridge.sol` - Data validation
- `contracts/src/core/OffchainDataHandler.sol` - IPFS management
- `contracts/scripts/deploy-certified.js` - Deployment script

### Modified Files
- `backend/authentification/signals.py` - Added blockchain sync signals
- `contracts/package.json` - Added new deploy scripts
- `contracts/README.md` - Updated documentation

### Removed Files
- `contracts/artifacts/` - Build artifacts (regenerated on compile)
- `contracts/cache/` - Cache files
- `contracts/tokens/` - Old directory (moved to src/tokens)
- Old test files - Kept only sentinel.test.js

## Troubleshooting

### "Cannot connect to blockchain"
- Verify RPC URL is correct and network is operational
- Check if BLOCKCHAIN_ENABLED=true
- For local: ensure `npx hardhat node` is running

### "Invalid signature"
- Check private key is correct (remove 0x if present in .env)
- Verify signer address matches what you deployed with
- Check timestamp window (1 hour default)

### "IPFS upload failed"
- Check Pinata credentials
- Verify photo file exists
- Check internet connection

### "Contract address not found"
- Re-deploy contracts and copy addresses to .env
- Check address format (should start with 0x and be 42 chars)

## Next Steps

1. **Deploy contracts** to your chosen network
2. **Configure Django** with contract addresses
3. **Test in development** - verify a tree or earn a certification
4. **Monitor blockchain** - watch on-chain data appear in real-time
5. **Build UI** - show user's on-chain achievements
6. **Create explorer** - display all on-chain records
7. **Set up indexing** - use The Graph for efficient queries

## Production Checklist

- [ ] Deploy contracts to mainnet
- [ ] Use secure private key management (e.g., AWS Secrets Manager)
- [ ] Set up IPFS with redundancy
- [ ] Configure proper gas prices for network
- [ ] Test full workflow end-to-end
- [ ] Set up monitoring/alerting for blockchain sync
- [ ] Back up deployment addresses
- [ ] Security audit of contracts
- [ ] Train team on new system

## Support

For detailed information:
- Backend integration: See `backend/BLOCKCHAIN_INTEGRATION.md`
- Contract documentation: See `contracts/README.md`
- Configuration: See `backend/blockchain_config.py`
- Service code: See `backend/blockchain_service.py`
