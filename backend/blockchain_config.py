"""
Blockchain Configuration and Setup
File: backend/blockchain_config.py

Configure this file with your blockchain contract addresses and settings.
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Blockchain RPC Configuration
BLOCKCHAIN_CONFIG = {
    # Network RPC URL
    'RPC_URL': os.getenv('BLOCKCHAIN_RPC_URL', 'http://localhost:8545'),
    
    # Contract Addresses (set after deployment)
    'CERTIFICATES_DATA_ADDRESS': os.getenv('BLOCKCHAIN_CERTIFICATES_DATA_ADDRESS'),
    'API_BRIDGE_ADDRESS': os.getenv('BLOCKCHAIN_API_BRIDGE_ADDRESS'),
    'OFFCHAIN_DATA_HANDLER_ADDRESS': os.getenv('BLOCKCHAIN_OFFCHAIN_DATA_HANDLER_ADDRESS'),
    
    # Backend signer (private key to sign data)
    'SIGNER_PRIVATE_KEY': os.getenv('BLOCKCHAIN_SIGNER_PRIVATE_KEY'),
    
    # Enable/disable blockchain sync
    'ENABLED': os.getenv('BLOCKCHAIN_ENABLED', 'true').lower() == 'true',
    
    # IPFS Configuration
    'IPFS_GATEWAY': os.getenv('IPFS_GATEWAY_URL', 'https://gateway.pinata.cloud/ipfs/'),
    'IPFS_API_URL': os.getenv('IPFS_API_URL', 'https://api.pinata.cloud'),
    'IPFS_API_KEY': os.getenv('PINATA_API_KEY'),
    'IPFS_API_SECRET': os.getenv('PINATA_API_SECRET'),
}


# Contract ABIs (Application Binary Interfaces)
# Add these after compiling your contracts

CERTIFICATE_DATA_ABI = [
    {
        "inputs": [
            {"name": "_userWallet", "type": "address"},
            {"name": "_userId", "type": "string"},
            {"name": "_certificationName", "type": "string"},
            {"name": "_pointsEarned", "type": "uint256"},
            {"name": "_treeCount", "type": "uint256"}
        ],
        "name": "recordCertificate",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    }
]

API_BRIDGE_ABI = [
    {
        "inputs": [
            {"name": "_userWallet", "type": "address"},
            {"name": "_userId", "type": "string"},
            {"name": "_certificationName", "type": "string"},
            {"name": "_pointsEarned", "type": "uint256"},
            {"name": "_treeCount", "type": "uint256"},
            {"name": "_signature", "type": "bytes"}
        ],
        "name": "submitCertificate",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    },
    {
        "inputs": [
            {"name": "_userWallet", "type": "address"},
            {"name": "_treeSpecies", "type": "string"},
            {"name": "_latitude", "type": "int256"},
            {"name": "_longitude", "type": "int256"},
            {"name": "_altitude", "type": "int256"},
            {"name": "_photoIPFSHash", "type": "string"},
            {"name": "_authenticityScore", "type": "uint256"},
            {"name": "_healthAssessment", "type": "string"},
            {"name": "_signature", "type": "bytes"}
        ],
        "name": "submitTreeUpdate",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    }
]


print("""
🔗 Blockchain Configuration Loaded
=====================================

To complete blockchain integration:

1. Deploy contracts (if not already deployed):
   cd contracts
   npm run deploy:certified:mumbai  # or your chosen network

2. Set environment variables in .env:
   BLOCKCHAIN_RPC_URL=<your_rpc_url>
   BLOCKCHAIN_CERTIFICATES_DATA_ADDRESS=<deployed_address>
   BLOCKCHAIN_API_BRIDGE_ADDRESS=<deployed_address>
   BLOCKCHAIN_SIGNER_PRIVATE_KEY=<backend_wallet_private_key>
   IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
   PINATA_API_KEY=<your_key>
   PINATA_API_SECRET=<your_secret>

3. Test blockchain sync:
   python manage.py shell
   >>> from blockchain_service import get_blockchain_service
   >>> bs = get_blockchain_service()
   >>> # Service is ready to use

Current Configuration:
  - Blockchain Enabled: {enabled}
  - RPC URL: {rpc}
  - API Bridge Address: {bridge}
  - Data Storage: CertificateData contract
  - IPFS Gateway: {ipfs}
""".format(
    enabled=BLOCKCHAIN_CONFIG['ENABLED'],
    rpc=BLOCKCHAIN_CONFIG['RPC_URL'],
    bridge=BLOCKCHAIN_CONFIG['API_BRIDGE_ADDRESS'] or 'Not set',
    ipfs=BLOCKCHAIN_CONFIG['IPFS_GATEWAY']
))
