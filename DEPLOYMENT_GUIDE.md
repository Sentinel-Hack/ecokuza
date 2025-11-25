# Blockchain Deployment Guide

## Current Status

The blockchain integration system has been fully implemented, but the current environment has disk space limitations that prevent running `npm install` and deployment.

## To Deploy Contracts

### Prerequisites
- Node.js v18+ (or v20+ recommended)
- At least 2GB free disk space
- Access to blockchain RPC endpoint

### Step 1: Install Dependencies

```bash
cd /home/frank/ecokuza/contracts
npm install
```

If you get disk space errors, free up space first:
```bash
# Check disk space
df -h

# Clear npm cache
npm cache clean --force

# Remove node_modules if needed and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Step 2: Compile Contracts

```bash
npm run compile
```

This generates contract ABIs needed for Django.

### Step 3: Deploy to Your Network

**Option A: Local Hardhat Network (for testing)**
```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy to local
npm run deploy:certified:local
```

**Option B: Polygon Mumbai (testnet)**
First, set up `.env` in the `contracts` folder:
```env
PRIVATE_KEY=your_private_key_here
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
```

Then deploy:
```bash
npm run deploy:certified:mumbai
```

**Option C: Other Networks**
```bash
npm run deploy:certified:polygon      # Polygon mainnet
npm run deploy:certified:zkevm        # Polygon zkEVM
```

### Step 4: Save Deployment Addresses

After deployment, you'll see output like:
```
PointsEngine:          0x...
ClubRegistry:          0x...
VerifierRegistry:      0x...
ImpactCertificate:     0x...
SentinelClubs:         0x...
CertificateData:       0x...       ← COPY THESE THREE
APIBridge:             0x...       ← FOR DJANGO
OffchainDataHandler:   0x...       ← CONFIGURATION
```

Deployment addresses are also saved to: `contracts/deployments/{network}-{timestamp}.json`

## Django Configuration

Once contracts are deployed, configure Django's `.env` file:

```env
# Blockchain RPC
BLOCKCHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com
# or for local: http://localhost:8545
# or for Polygon mainnet: https://polygon-rpc.com
# or for zkEVM: https://rpc.cardona.zkevm-testnet.com

# Contract Addresses (from deployment above)
BLOCKCHAIN_CERTIFICATES_DATA_ADDRESS=0x...
BLOCKCHAIN_API_BRIDGE_ADDRESS=0x...
BLOCKCHAIN_OFFCHAIN_DATA_HANDLER_ADDRESS=0x...

# Backend signer (account that signs data)
# Use an account with test ETH on your network
BLOCKCHAIN_SIGNER_PRIVATE_KEY=your_private_key_without_0x_prefix

# Enable blockchain sync
BLOCKCHAIN_ENABLED=true

# IPFS Configuration (for photo uploads)
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
PINATA_API_KEY=your_key
PINATA_API_SECRET=your_secret
```

## Testing Deployment

### Test Locally First
```bash
# Terminal 1: Start local network
cd contracts
npx hardhat node

# Terminal 2: Deploy locally
npm run deploy:certified:local

# Terminal 3: Test Django integration
cd ../backend
python manage.py shell
>>> from authentification.models import UserCertification, Certification, CustomUser
>>> user = CustomUser.objects.first()
>>> cert = Certification.objects.first()
>>> # This will trigger blockchain sync
>>> UserCertification.objects.create(user=user, certification=cert)
# Watch for "✅ Certification synced to blockchain"
```

### Verify on Blockchain
- **Local**: Use Hardhat console
- **Mumbai Testnet**: [mumbai.polygonscan.com](https://mumbai.polygonscan.com)
- **Polygon**: [polygonscan.com](https://polygonscan.com)
- **zkEVM**: [testnet.zkevm.polygonscan.com](https://testnet.zkevm.polygonscan.com)

Search for your contract address to verify deployment.

## Smart Contracts Details

### Deployment Order
1. **PointsEngine** - Independent (no dependencies)
2. **ClubRegistry** - Independent
3. **VerifierRegistry** - Independent
4. **ImpactCertificate** - Independent (ERC721)
5. **SentinelClubs** - Depends on PointsEngine
6. **CertificateData** - Independent
7. **APIBridge** - Depends on CertificateData (configured after)
8. **OffchainDataHandler** - Independent

### Data Flow After Deployment

```
Tree Verified in Django
    ↓
Signal fires
    ↓
blockchain_service.submit_tree_update()
    - Signs with BLOCKCHAIN_SIGNER_PRIVATE_KEY
    - Uploads photo to IPFS
    - Creates transaction
    ↓
APIBridge.submitTreeUpdate()
    - Validates signature on-chain
    - Forwards to CertificateData
    ↓
CertificateData.recordTreeUpdate()
    - Stores record
    - Updates user metrics
    - Emits event
    ↓
✅ Data persisted on blockchain
```

## Troubleshooting

### "Hardhat not found"
```bash
cd contracts
npm install
# If npm fails, clear cache first:
npm cache clean --force
```

### "No space left on device"
```bash
# Check space
df -h /

# Free up space
docker system prune -a
docker image prune -a
# Or delete unnecessary files

# Try npm install again
npm install
```

### "Network error during npm install"
```bash
# Try npm again (sometimes temporary network issue)
npm install

# Or use a different npm registry
npm install --registry https://registry.npmjs.org/
```

### "Private key error during deployment"
- Ensure PRIVATE_KEY is set in `.env`
- Private key should have test ETH on the target network
- Don't include "0x" prefix in .env

### "Contract deployment failed"
- Ensure you have enough test ETH for gas
- Check RPC URL is correct
- Try with lower gas price settings

## Support Documentation

For more detailed information:
- **Quick Start**: [BLOCKCHAIN_SETUP_COMPLETE.md](../BLOCKCHAIN_SETUP_COMPLETE.md)
- **Django Guide**: [backend/BLOCKCHAIN_INTEGRATION.md](../backend/BLOCKCHAIN_INTEGRATION.md)
- **Contract Details**: [README.md](./README.md)
- **Configuration**: [backend/blockchain_config.py](../backend/blockchain_config.py)

## Next Steps

1. ✅ Code is complete and ready
2. ⏳ Deploy contracts (when disk space available)
3. ⏳ Configure Django with contract addresses
4. ⏳ Install Django dependencies: `pip install web3 eth-account`
5. ⏳ Test integration end-to-end
6. ⏳ Monitor blockchain events

