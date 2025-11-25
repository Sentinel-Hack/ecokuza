"""
Service for interacting with blockchain contracts.
Handles signing and sending data to the blockchain via APIBridge.
"""

import os
import json
import hashlib
from datetime import datetime, timedelta
import requests
from eth_account import Account
from eth_account.messages import encode_defunct
from web3 import Web3

# Configuration from environment variables
BLOCKCHAIN_RPC_URL = os.getenv('BLOCKCHAIN_RPC_URL', 'http://localhost:8545')
BLOCKCHAIN_API_BRIDGE_ADDRESS = os.getenv('BLOCKCHAIN_API_BRIDGE_ADDRESS')
BLOCKCHAIN_SIGNER_PRIVATE_KEY = os.getenv('BLOCKCHAIN_SIGNER_PRIVATE_KEY')
IPFS_GATEWAY_URL = os.getenv('IPFS_GATEWAY_URL', 'https://gateway.pinata.cloud/ipfs/')
ENABLE_BLOCKCHAIN_SYNC = os.getenv('ENABLE_BLOCKCHAIN_SYNC', 'true').lower() == 'true'


class BlockchainService:
    """Service for syncing Django data to blockchain."""

    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(BLOCKCHAIN_RPC_URL))
        self.api_bridge_address = BLOCKCHAIN_API_BRIDGE_ADDRESS
        self.signer_account = Account.from_key(BLOCKCHAIN_SIGNER_PRIVATE_KEY) if BLOCKCHAIN_SIGNER_PRIVATE_KEY else None
        
        if not self.w3.is_connected():
            print(f"⚠️  Warning: Cannot connect to blockchain at {BLOCKCHAIN_RPC_URL}")

    @staticmethod
    def upload_to_ipfs(file_path):
        """
        Upload a file to IPFS and return the hash.
        This is a placeholder - implement with pinata or your IPFS provider.
        """
        try:
            # For now, return a mock IPFS hash
            # In production, use: pinata.cloud, web3.storage, etc.
            with open(file_path, 'rb') as f:
                content = f.read()
            
            # Simple deterministic hash for demo
            ipfs_hash = "Qm" + hashlib.sha256(content).hexdigest()[:44]
            return ipfs_hash
        except Exception as e:
            print(f"Error uploading to IPFS: {e}")
            return None

    def _create_message_hash(self, data_dict):
        """Create a keccak256 hash of the data for signing."""
        # Convert to JSON and hash
        message = json.dumps(data_dict, sort_keys=True)
        return Web3.keccak(text=message)

    def _sign_data(self, message_hash):
        """Sign data with the signer's private key."""
        if not self.signer_account:
            raise ValueError("Signer private key not configured")
        
        message = encode_defunct(message_hash)
        signed_message = self.w3.eth.account.sign_message(message, private_key=BLOCKCHAIN_SIGNER_PRIVATE_KEY)
        return signed_message.signature.hex()

    def submit_certification(self, user_wallet, user_id, certification_name, points_earned, tree_count):
        """
        Submit a certification to the blockchain via APIBridge.
        
        Args:
            user_wallet: User's blockchain wallet address (hex string)
            user_id: Django user ID (string)
            certification_name: Name of certification (string)
            points_earned: Total points (int)
            tree_count: Number of verified trees (int)
        
        Returns:
            Transaction receipt or None if failed
        """
        if not ENABLE_BLOCKCHAIN_SYNC:
            print("ℹ️  Blockchain sync disabled - skipping certification submission")
            return None

        try:
            if not self.api_bridge_address:
                print("⚠️  API Bridge address not configured")
                return None

            # Prepare data
            data = {
                "userWallet": Web3.to_checksum_address(user_wallet),
                "userId": str(user_id),
                "certificationName": certification_name,
                "pointsEarned": int(points_earned),
                "treeCount": int(tree_count),
                "timestamp": int(datetime.now().timestamp())
            }

            # Create and sign message
            message_hash = self._create_message_hash(data)
            signature = self._sign_data(message_hash)

            # Call the contract (in production, would be a web3.py transaction)
            print(f"📋 Would submit certification to blockchain: {certification_name} for {user_wallet}")
            print(f"   Points: {points_earned}, Trees: {tree_count}")
            print(f"   Signature: {signature[:20]}...")

            # TODO: Make actual contract call via web3.py
            # receipt = self.w3.eth.send_transaction({...})

            return {
                "status": "pending",
                "certification": certification_name,
                "points": points_earned,
                "signature": signature
            }

        except Exception as e:
            print(f"❌ Error submitting certification to blockchain: {e}")
            return None

    def submit_tree_update(self, user_wallet, tree_species, latitude, longitude, altitude, 
                          photo_path, authenticity_score, health_assessment):
        """
        Submit a tree update with photo to blockchain.
        
        Args:
            user_wallet: User's wallet address
            tree_species: Tree species name
            latitude, longitude, altitude: GPS coordinates
            photo_path: Path to photo file
            authenticity_score: AI authenticity score (0-100)
            health_assessment: Health status string
        
        Returns:
            Update ID or None if failed
        """
        if not ENABLE_BLOCKCHAIN_SYNC:
            print("ℹ️  Blockchain sync disabled - skipping tree update submission")
            return None

        try:
            if not self.api_bridge_address:
                print("⚠️  API Bridge address not configured")
                return None

            # Upload photo to IPFS
            ipfs_hash = self.upload_to_ipfs(photo_path)
            if not ipfs_hash:
                print("⚠️  Failed to upload photo to IPFS")
                return None

            # Prepare data (converting floats to ints for blockchain: multiply by 1e6)
            data = {
                "userWallet": Web3.to_checksum_address(user_wallet),
                "treeSpecies": tree_species,
                "latitude": int(float(latitude) * 1e6),
                "longitude": int(float(longitude) * 1e6),
                "altitude": int(float(altitude) * 1e6),
                "photoIPFSHash": ipfs_hash,
                "authenticityScore": int(authenticity_score),
                "healthAssessment": health_assessment,
                "timestamp": int(datetime.now().timestamp())
            }

            # Create and sign
            message_hash = self._create_message_hash(data)
            signature = self._sign_data(message_hash)

            print(f"🌳 Would submit tree update to blockchain:")
            print(f"   Species: {tree_species}")
            print(f"   Location: ({latitude}, {longitude}, {altitude})")
            print(f"   Photo IPFS: {ipfs_hash}")
            print(f"   Authenticity Score: {authenticity_score}")

            # TODO: Make actual contract call
            # receipt = self.w3.eth.send_transaction({...})

            return {
                "status": "pending",
                "ipfs_hash": ipfs_hash,
                "signature": signature
            }

        except Exception as e:
            print(f"❌ Error submitting tree update to blockchain: {e}")
            return None


# Global instance
_blockchain_service = None


def get_blockchain_service():
    """Get or create blockchain service instance."""
    global _blockchain_service
    if _blockchain_service is None:
        _blockchain_service = BlockchainService()
    return _blockchain_service
