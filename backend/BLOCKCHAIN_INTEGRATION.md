# Blockchain Integration Guide

## Overview

The Sentinel Ecokuza system now supports blockchain integration for certificate and tree data capture. When a user's tree record is verified or a certification is earned, the data is automatically synced to the blockchain with IPFS references for photos.

## Architecture

```
Django Backend
    ↓
    ├→ Tree Record Verified
    │   ├→ Signal fires
    │   └→ blockchain_service.submit_tree_update()
    │       ├→ Upload photo to IPFS
    │       ├→ Sign data with backend key
    │       └→ Call APIBridge.submitTreeUpdate()
    │
    └→ Certification Earned
        ├→ Signal fires
        └→ blockchain_service.submit_certification()
            ├→ Sign data with backend key
            └→ Call APIBridge.submitCertificate()

Blockchain (Smart Contracts)
    ├→ APIBridge (validates signatures)
    │   └→ forwards to →
    │
    └→ CertificateData
        ├→ Stores certificate records with points & tree count
        ├→ Stores tree updates with GPS & IPFS hashes
        └→ Emits events for data captured

OffchainDataHandler
    └→ Manages IPFS/Arweave references
        └→ Stores metadata for certificates & images
```

## Setup Instructions

### 1. Deploy Smart Contracts

```bash
cd contracts
npm install
npm run compile
npm run deploy:certified:mumbai  # or your chosen network
```

This will deploy:
- `CertificateData` - Main storage contract
- `APIBridge` - Data validation & forwarding
- `OffchainDataHandler` - IPFS/Arweave reference manager
- Plus existing contracts (PointsEngine, SentinelClubs, etc.)

Deployment addresses will be saved to `contracts/deployments/`.

### 2. Configure Django Backend

Add these environment variables to your `.env` file:

```env
# Blockchain RPC
BLOCKCHAIN_RPC_URL=https://rpc.cardona.zkevm-testnet.com
# or for Mumbai: https://rpc-mumbai.maticvigil.com
# or localhost: http://localhost:8545

# Contract Addresses (from deployment step)
BLOCKCHAIN_CERTIFICATES_DATA_ADDRESS=0x...
BLOCKCHAIN_API_BRIDGE_ADDRESS=0x...
BLOCKCHAIN_OFFCHAIN_DATA_HANDLER_ADDRESS=0x...

# Backend signer private key (without 0x prefix)
BLOCKCHAIN_SIGNER_PRIVATE_KEY=your_private_key_here

# Enable blockchain sync
BLOCKCHAIN_ENABLED=true

# IPFS Configuration (using Pinata as example)
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
PINATA_API_KEY=your_pinata_key
PINATA_API_SECRET=your_pinata_secret
```

### 3. Install Python Dependencies

```bash
cd backend
pip install web3 eth-account
```

### 4. Run Django Migrations

```bash
python manage.py migrate
```

## How It Works

### When a Tree Record is Verified

1. Admin marks a `TreeRecord` as `verified=True`
2. Django signal handler triggers: `notify_blockchain_on_tree_verification()`
3. Backend service:
   - Uploads photo to IPFS (returns hash)
   - Creates transaction data (species, GPS, IPFS hash, authenticity score)
   - Signs data with backend wallet
   - Calls `APIBridge.submitTreeUpdate()`
4. Smart contract validates signature and stores data in `CertificateData`
5. Event emitted for indexing

### When a Certification is Earned

1. User's points reach certification threshold
2. `UserCertification` is created automatically
3. Django signal handler triggers: `notify_blockchain_on_certification()`
4. Backend service:
   - Creates transaction data (certification name, points, tree count)
   - Signs with backend wallet
   - Calls `APIBridge.submitCertificate()`
5. Smart contract validates and stores data in `CertificateData`
6. Event emitted for indexing

## Data Flow

### Tree Update Data (On-Chain Storage)

```solidity
struct TreeUpdate {
    address userWallet;
    string treeSpecies;
    float latitude;
    float longitude;
    float altitude;
    string photoIPFSHash;        // IPFS hash of tree photo
    uint256 authenticity_score;  // AI score: 0-100
    string healthAssessment;     // Health status
    uint256 timestamp;
}
```

### Certificate Data (On-Chain Storage)

```solidity
struct CertificateRecord {
    address userWallet;
    string certificationName;
    uint256 pointsEarned;
    uint256 treeCount;
    bool isActive;
    uint256 timestamp;
}
```

## Testing the Integration

### 1. Test Locally

```bash
# Terminal 1: Start hardhat local blockchain
cd contracts
npx hardhat node

# Terminal 2: Deploy contracts locally
npm run deploy:certified:local

# Terminal 3: Run Django with blockchain enabled
cd ../backend
BLOCKCHAIN_ENABLED=true python manage.py runserver
```

### 2. Test Certificate Sync

```bash
python manage.py shell
>>> from authentification.models import UserCertification, Certification, CustomUser
>>> user = CustomUser.objects.first()
>>> cert = Certification.objects.first()
>>> # This will trigger the signal and sync to blockchain
>>> uc = UserCertification.objects.create(user=user, certification=cert)
```

### 3. Test Tree Update Sync

```bash
python manage.py shell
>>> from trees.models import TreeRecord
>>> tree = TreeRecord.objects.first()
>>> tree.verified = True
>>> tree.save(update_fields=['verified'])
>>> # Check logs for blockchain sync confirmation
```

### 4. Verify Data on Blockchain

```bash
cd contracts
npx hardhat run scripts/query-data.js --network localhost
# or
node scripts/query-blockchain-data.js
```

## Troubleshooting

### "Cannot connect to blockchain"
- Check `BLOCKCHAIN_RPC_URL` is correct and accessible
- Verify network is operational
- For local testing: ensure `npx hardhat node` is running

### "Invalid signature"
- Check `BLOCKCHAIN_SIGNER_PRIVATE_KEY` is correct
- Ensure the signer address matches what's configured in APIBridge
- Private key should not include '0x' prefix in .env

### "Photo upload failed"
- Check IPFS gateway credentials (Pinata keys)
- Verify photo file exists and is readable
- Check storage space on IPFS provider

### Certification not syncing
- Enable `BLOCKCHAIN_ENABLED=true` in .env
- Check Django signals are properly connected
- View logs for signal execution: `python manage.py shell`
- Verify `UserCertification` model is properly configured

## Advanced: Custom Wallet Management

By default, the system uses a deterministic wallet based on user ID:
```python
user_wallet = f"0x{user.id:040x}"
```

To use actual user wallets:

1. Add blockchain wallet field to `CustomUser` model:
```python
class CustomUser(AbstractUser):
    blockchain_wallet = models.CharField(max_length=42, null=True, blank=True)
```

2. Update signal to use it:
```python
user_wallet = instance.user.blockchain_wallet or f"0x{user.id:040x}"
```

## Security Considerations

1. **Private Key Management**
   - Store `BLOCKCHAIN_SIGNER_PRIVATE_KEY` securely
   - Use environment variables or secrets manager (not in code)
   - For production: use HSM or hardware wallet

2. **Signature Verification**
   - APIBridge validates all signatures
   - Replays prevented with message hashing and uniqueness checks
   - Timestamp window limits (1 hour default)

3. **Contract Access Control**
   - Only authorized `APIHandler` can write data
   - Ownership checks prevent unauthorized modifications
   - Regular security audits recommended

## Contract Functions Reference

### CertificateData Contract

```solidity
// Record a new certificate
function recordCertificate(
    address _userWallet,
    string _userId,
    string _certificationName,
    uint256 _pointsEarned,
    uint256 _treeCount
) external returns (uint256)

// Record a tree update
function recordTreeUpdate(
    address _userWallet,
    string _treeSpecies,
    float _latitude,
    float _longitude,
    float _altitude,
    string _photoIPFSHash,
    uint256 _authenticityScore,
    string _healthAssessment
) external returns (uint256)

// Query user's impact
function getUserImpactSummary(address _userWallet) external view returns (UserImpact)
```

### APIBridge Contract

```solidity
// Submit certificate with signature
function submitCertificate(
    address _userWallet,
    string _userId,
    string _certificationName,
    uint256 _pointsEarned,
    uint256 _treeCount,
    bytes _signature
) external returns (uint256)

// Submit tree update with signature
function submitTreeUpdate(
    address _userWallet,
    string _treeSpecies,
    int256 _latitude,
    int256 _longitude,
    int256 _altitude,
    string _photoIPFSHash,
    uint256 _authenticityScore,
    string _healthAssessment,
    bytes _signature
) external returns (uint256)
```

## Next Steps

1. ✅ Deploy contracts to your chosen network
2. ✅ Configure Django with contract addresses
3. ✅ Test integration in development
4. ✅ Set up IPFS for photo uploads
5. ✅ Monitor blockchain events and indexing
6. ⬜ Build frontend to display on-chain certificates
7. ⬜ Create blockchain explorer dashboard

## Support

For issues or questions:
1. Check logs: `python manage.py shell` and monitor blockchain_service output
2. Verify contract deployment: `npx hardhat run scripts/verify-deployment.js`
3. Test RPC connection: `curl https://your-rpc-url`

