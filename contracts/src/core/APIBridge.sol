// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./CertificateData.sol";

/// @title APIBridge - Receives and validates data from Django backend
/// @notice Handles signature verification and forwards validated data to CertificateData contract
contract APIBridge is Ownable {
    using ECDSA for bytes32;
    
    CertificateData public certificateData;
    address public signer;  // Django backend signer address
    
    mapping(bytes32 => bool) public processedHashes;  // Prevent replay attacks
    
    event DataReceived(bytes32 indexed dataHash, address indexed userWallet, string dataType);
    event SignerUpdated(address indexed newSigner);
    event DuplicateDataRejected(bytes32 indexed dataHash);
    
    modifier onlySigner(bytes calldata _signature, bytes32 _messageHash) {
        bytes32 ethSignedHash = _messageHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedHash.recover(_signature);
        require(recoveredSigner == signer, "Invalid signature");
        _;
    }
    
    constructor(address _certificateData) Ownable(msg.sender) {
        require(_certificateData != address(0), "Invalid CertificateData address");
        certificateData = CertificateData(_certificateData);
    }
    
    /// @notice Set the Django backend signer address
    function setSigner(address _signer) external onlyOwner {
        require(_signer != address(0), "Invalid signer address");
        signer = _signer;
        emit SignerUpdated(_signer);
    }
    
    /// @notice Receive certificate data from Django backend
    /// @param _userWallet User's blockchain wallet
    /// @param _userId Django user ID
    /// @param _certificationName Certificate name
    /// @param _pointsEarned Points earned
    /// @param _treeCount Tree count
    /// @param _signature ECDSA signature from Django backend
    function submitCertificate(
        address _userWallet,
        string calldata _userId,
        string calldata _certificationName,
        uint256 _pointsEarned,
        uint256 _treeCount,
        bytes calldata _signature
    ) external returns (uint256) {
        require(_userWallet != address(0), "Invalid wallet");
        require(signer != address(0), "Signer not set");
        
        // Create message hash from parameters
        bytes32 messageHash = keccak256(abi.encodePacked(
            "submitCertificate",
            _userWallet,
            _userId,
            _certificationName,
            _pointsEarned,
            _treeCount,
            block.timestamp / 1 hours  // Expire after 1 hour
        ));
        
        // Check for duplicate submission
        require(!processedHashes[messageHash], "Duplicate submission");
        
        // Verify signature
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedHash.recover(_signature);
        require(recoveredSigner == signer, "Invalid signature");
        
        // Mark as processed
        processedHashes[messageHash] = true;
        
        // Forward to CertificateData contract
        uint256 certId = certificateData.recordCertificate(
            _userWallet,
            _userId,
            _certificationName,
            _pointsEarned,
            _treeCount
        );
        
        emit DataReceived(messageHash, _userWallet, "certificate");
        
        return certId;
    }
    
    /// @notice Receive tree update data from Django backend
    /// @param _userWallet User's blockchain wallet
    /// @param _treeSpecies Tree species
    /// @param _latitude GPS latitude (as int: multiply by 1e6)
    /// @param _longitude GPS longitude (as int: multiply by 1e6)
    /// @param _altitude GPS altitude
    /// @param _photoIPFSHash IPFS hash
    /// @param _authenticityScore AI score
    /// @param _healthAssessment Health status
    /// @param _signature Backend signature
    function submitTreeUpdate(
        address _userWallet,
        string calldata _treeSpecies,
        int256 _latitude,
        int256 _longitude,
        int256 _altitude,
        string calldata _photoIPFSHash,
        uint256 _authenticityScore,
        string calldata _healthAssessment,
        bytes calldata _signature
    ) external returns (uint256) {
        require(_userWallet != address(0), "Invalid wallet");
        require(signer != address(0), "Signer not set");
        require(bytes(_photoIPFSHash).length > 0, "IPFS hash required");
        
        // Create message hash
        bytes32 messageHash = keccak256(abi.encodePacked(
            "submitTreeUpdate",
            _userWallet,
            _treeSpecies,
            _latitude,
            _longitude,
            _altitude,
            _photoIPFSHash,
            _authenticityScore,
            _healthAssessment,
            block.timestamp / 1 hours
        ));
        
        // Check for duplicate
        require(!processedHashes[messageHash], "Duplicate submission");
        
        // Verify signature
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedHash.recover(_signature);
        require(recoveredSigner == signer, "Invalid signature");
        
        // Mark as processed
        processedHashes[messageHash] = true;
        
        // Convert int coordinates to float for storage
        // Note: In production, you might want to keep these as int256 for precision
        float memory latFloat = float(_latitude) / 1e6;
        float memory lonFloat = float(_longitude) / 1e6;
        float memory altFloat = float(_altitude) / 1e6;
        
        // Forward to CertificateData contract
        uint256 updateId = certificateData.recordTreeUpdate(
            _userWallet,
            _treeSpecies,
            latFloat,
            lonFloat,
            altFloat,
            _photoIPFSHash,
            _authenticityScore,
            _healthAssessment
        );
        
        emit DataReceived(messageHash, _userWallet, "tree_update");
        
        return updateId;
    }
    
    /// @notice Helper to convert int to float (approximate)
    function float(int256 value) internal pure returns (float) {
        // This is a simplified conversion; use a proper fixed-point library in production
        if (value >= 0) {
            return float(uint256(value));
        }
        return -float(uint256(-value));
    }
}
