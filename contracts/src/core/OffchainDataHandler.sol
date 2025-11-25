// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title OffchainDataHandler - Manages IPFS and Arweave references
/// @notice Stores metadata about offchain data (photos, certificates) with hashes
contract OffchainDataHandler is Ownable {
    
    /// @notice Structure for IPFS data references
    struct IPFSReference {
        string ipfsHash;              // IPFS hash (CIDv1 format)
        string contentType;           // Content type (image/jpeg, etc.)
        uint256 size;                 // File size in bytes
        uint64 uploadTimestamp;       // When file was uploaded
        address uploader;             // Who uploaded it
        bool verified;                // Verified by backend
    }
    
    /// @notice Structure for Arweave references
    struct ArweaveReference {
        string transactionId;         // Arweave transaction ID
        string contentType;
        uint256 size;
        uint64 uploadTimestamp;
        address uploader;
        bool verified;
    }
    
    /// @notice Structure for certificate metadata
    struct CertificateMetadata {
        string certificateName;
        string description;
        string iconURI;               // IPFS or Arweave URI for badge icon
        uint256 rarity;               // 0=common, 1=uncommon, 2=rare, 3=legendary
        string jsonMetadataURI;       // IPFS URI to full metadata JSON
    }
    
    // Storage
    mapping(string => IPFSReference) public ipfsReferences;
    mapping(string => ArweaveReference) public arweaveReferences;
    mapping(string => CertificateMetadata) public certificateMetadata;
    
    string[] public allIPFSHashes;
    string[] public allArweaveIds;
    
    address public ipfsGateway;       // IPFS gateway URL stored as address-compatible
    
    event IPFSReferenceStored(
        string indexed ipfsHash,
        string contentType,
        uint256 size,
        address indexed uploader
    );
    
    event ArweaveReferenceStored(
        string indexed transactionId,
        string contentType,
        uint256 size,
        address indexed uploader
    );
    
    event CertificateMetadataStored(
        string indexed certificateName,
        uint256 rarity,
        string jsonMetadataURI
    );
    
    event IPFSReferenceVerified(string indexed ipfsHash);
    event ArweaveReferenceVerified(string indexed transactionId);
    
    constructor() Ownable(msg.sender) {}
    
    /// @notice Store an IPFS reference for a tree photo or other data
    /// @param _ipfsHash IPFS hash (CIDv1)
    /// @param _contentType File content type
    /// @param _size File size in bytes
    function storeIPFSReference(
        string calldata _ipfsHash,
        string calldata _contentType,
        uint256 _size
    ) external returns (bool) {
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        require(_size > 0, "Size must be positive");
        require(bytes(_contentType).length > 0, "Content type required");
        
        IPFSReference storage ref = ipfsReferences[_ipfsHash];
        if (bytes(ref.ipfsHash).length == 0) {
            // New reference
            allIPFSHashes.push(_ipfsHash);
        }
        
        ref.ipfsHash = _ipfsHash;
        ref.contentType = _contentType;
        ref.size = _size;
        ref.uploadTimestamp = uint64(block.timestamp);
        ref.uploader = msg.sender;
        ref.verified = false;
        
        emit IPFSReferenceStored(_ipfsHash, _contentType, _size, msg.sender);
        
        return true;
    }
    
    /// @notice Store an Arweave reference
    /// @param _transactionId Arweave transaction ID
    /// @param _contentType File content type
    /// @param _size File size
    function storeArweaveReference(
        string calldata _transactionId,
        string calldata _contentType,
        uint256 _size
    ) external returns (bool) {
        require(bytes(_transactionId).length > 0, "Transaction ID required");
        require(_size > 0, "Size must be positive");
        
        ArweaveReference storage ref = arweaveReferences[_transactionId];
        if (bytes(ref.transactionId).length == 0) {
            allArweaveIds.push(_transactionId);
        }
        
        ref.transactionId = _transactionId;
        ref.contentType = _contentType;
        ref.size = _size;
        ref.uploadTimestamp = uint64(block.timestamp);
        ref.uploader = msg.sender;
        ref.verified = false;
        
        emit ArweaveReferenceStored(_transactionId, _contentType, _size, msg.sender);
        
        return true;
    }
    
    /// @notice Verify an IPFS reference (only owner)
    /// @param _ipfsHash IPFS hash to verify
    function verifyIPFSReference(string calldata _ipfsHash) external onlyOwner {
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        require(bytes(ipfsReferences[_ipfsHash].ipfsHash).length > 0, "Reference not found");
        
        ipfsReferences[_ipfsHash].verified = true;
        emit IPFSReferenceVerified(_ipfsHash);
    }
    
    /// @notice Verify an Arweave reference (only owner)
    /// @param _transactionId Arweave transaction ID
    function verifyArweaveReference(string calldata _transactionId) external onlyOwner {
        require(bytes(_transactionId).length > 0, "Transaction ID required");
        require(bytes(arweaveReferences[_transactionId].transactionId).length > 0, "Reference not found");
        
        arweaveReferences[_transactionId].verified = true;
        emit ArweaveReferenceVerified(_transactionId);
    }
    
    /// @notice Store certificate metadata (name, icon, description)
    /// @param _certName Certificate name
    /// @param _description Certificate description
    /// @param _iconURI IPFS/Arweave URI to icon
    /// @param _rarity Rarity level (0-3)
    /// @param _jsonMetadataURI IPFS URI to full JSON metadata
    function storeCertificateMetadata(
        string calldata _certName,
        string calldata _description,
        string calldata _iconURI,
        uint256 _rarity,
        string calldata _jsonMetadataURI
    ) external onlyOwner {
        require(bytes(_certName).length > 0, "Name required");
        require(_rarity <= 3, "Invalid rarity");
        require(bytes(_iconURI).length > 0, "Icon URI required");
        
        CertificateMetadata storage meta = certificateMetadata[_certName];
        meta.certificateName = _certName;
        meta.description = _description;
        meta.iconURI = _iconURI;
        meta.rarity = _rarity;
        meta.jsonMetadataURI = _jsonMetadataURI;
        
        emit CertificateMetadataStored(_certName, _rarity, _jsonMetadataURI);
    }
    
    /// @notice Get IPFS reference details
    function getIPFSReference(string calldata _ipfsHash) external view returns (IPFSReference memory) {
        return ipfsReferences[_ipfsHash];
    }
    
    /// @notice Get Arweave reference details
    function getArweaveReference(string calldata _transactionId) external view returns (ArweaveReference memory) {
        return arweaveReferences[_transactionId];
    }
    
    /// @notice Get certificate metadata
    function getCertificateMetadata(string calldata _certName) external view returns (CertificateMetadata memory) {
        return certificateMetadata[_certName];
    }
    
    /// @notice Get total number of IPFS references stored
    function getIPFSReferenceCount() external view returns (uint256) {
        return allIPFSHashes.length;
    }
    
    /// @notice Get total number of Arweave references stored
    function getArweaveReferenceCount() external view returns (uint256) {
        return allArweaveIds.length;
    }
    
    /// @notice Check if IPFS reference exists and is verified
    function isIPFSReferenceVerified(string calldata _ipfsHash) external view returns (bool) {
        return ipfsReferences[_ipfsHash].verified;
    }
}
