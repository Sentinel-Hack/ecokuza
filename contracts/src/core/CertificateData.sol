// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../utils/Structs.sol";

/// @title CertificateData - Stores on-chain certificate data from Django backend
/// @notice Captures and stores user certifications, tree records, photos (via IPFS), and GPS data
contract CertificateData is Ownable {
    
    /// @notice Structure for storing certificate data from Django
    struct CertificateRecord {
        uint256 id;
        address userWallet;           // User's blockchain wallet
        string userId;                // Django user ID (for reference)
        string certificationName;     // Certificate name from Django
        uint256 pointsEarned;         // Total points when certificate was earned
        uint256 treeCount;            // Number of trees planted/verified
        uint256 timestamp;            // When certificate was earned
        bool isActive;                // Whether certificate is still valid
    }
    
    /// @notice Structure for storing tree update/record data
    struct TreeUpdate {
        uint256 id;
        address userWallet;
        string treeSpecies;           // Tree species planted/monitored
        float latitude;               // GPS latitude
        float longitude;              // GPS longitude
        float altitude;               // GPS altitude
        string photoIPFSHash;         // IPFS hash of the photo
        string photoArweaveId;        // Arweave ID of the photo (alternative)
        uint256 timestamp;            // When the update was recorded
        uint256 authenticity_score;   // AI authenticity score (0-100)
        string healthAssessment;      // Health status of tree
        string metadata;              // Additional JSON metadata
    }
    
    /// @notice Structure for storing user impact data
    struct UserImpact {
        address userWallet;
        uint256 totalPoints;          // Cumulative points
        uint256 totalTrees;           // Total trees planted
        uint256 totalCertifications;  // Number of certifications earned
        uint256 lastUpdated;          // Last update timestamp
        bool hasBlockchainRecord;     // Whether user has any blockchain records
    }
    
    // Storage mappings
    mapping(uint256 => CertificateRecord) public certificates;
    mapping(uint256 => TreeUpdate) public treeUpdates;
    mapping(address => UserImpact) public userImpact;
    mapping(address => uint256[]) public userCertificateIds;
    mapping(address => uint256[]) public userTreeUpdateIds;
    
    uint256 public nextCertificateId = 1;
    uint256 public nextTreeUpdateId = 1;
    
    address public apiHandler;  // Address authorized to push data from Django
    
    // Events
    event CertificateRecorded(
        uint256 indexed certId,
        address indexed userWallet,
        string certificationName,
        uint256 pointsEarned,
        uint256 treeCount,
        uint256 timestamp
    );
    
    event TreeUpdateRecorded(
        uint256 indexed updateId,
        address indexed userWallet,
        string treeSpecies,
        float latitude,
        float longitude,
        string photoIPFSHash,
        uint256 timestamp
    );
    
    event UserImpactUpdated(
        address indexed userWallet,
        uint256 totalPoints,
        uint256 totalTrees,
        uint256 totalCertifications
    );
    
    event APIHandlerUpdated(address indexed newHandler);
    
    modifier onlyAPIHandler() {
        require(msg.sender == apiHandler || msg.sender == owner(), "Not authorized to record data");
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /// @notice Set the API handler address (the contract that receives data from Django)
    function setAPIHandler(address _apiHandler) external onlyOwner {
        require(_apiHandler != address(0), "Invalid address");
        apiHandler = _apiHandler;
        emit APIHandlerUpdated(_apiHandler);
    }
    
    /// @notice Record a certificate from Django
    /// @param _userWallet User's blockchain wallet address
    /// @param _userId Django user ID as string
    /// @param _certificationName Name of the certification earned
    /// @param _pointsEarned Points earned when certificate was awarded
    /// @param _treeCount Number of trees planted/verified
    function recordCertificate(
        address _userWallet,
        string calldata _userId,
        string calldata _certificationName,
        uint256 _pointsEarned,
        uint256 _treeCount
    ) external onlyAPIHandler returns (uint256) {
        require(_userWallet != address(0), "Invalid wallet address");
        require(bytes(_certificationName).length > 0, "Certification name required");
        
        uint256 certId = nextCertificateId++;
        
        CertificateRecord storage cert = certificates[certId];
        cert.id = certId;
        cert.userWallet = _userWallet;
        cert.userId = _userId;
        cert.certificationName = _certificationName;
        cert.pointsEarned = _pointsEarned;
        cert.treeCount = _treeCount;
        cert.timestamp = block.timestamp;
        cert.isActive = true;
        
        userCertificateIds[_userWallet].push(certId);
        
        // Update user impact
        _updateUserImpact(_userWallet, _pointsEarned, _treeCount);
        
        emit CertificateRecorded(
            certId,
            _userWallet,
            _certificationName,
            _pointsEarned,
            _treeCount,
            block.timestamp
        );
        
        return certId;
    }
    
    /// @notice Record a tree update with GPS and photo data
    /// @param _userWallet User's blockchain wallet
    /// @param _treeSpecies Tree species name
    /// @param _latitude GPS latitude
    /// @param _longitude GPS longitude
    /// @param _altitude GPS altitude
    /// @param _photoIPFSHash IPFS hash of the tree photo
    /// @param _authenticityScore AI authenticity score (0-100)
    /// @param _healthAssessment Health assessment of the tree
    function recordTreeUpdate(
        address _userWallet,
        string calldata _treeSpecies,
        float _latitude,
        float _longitude,
        float _altitude,
        string calldata _photoIPFSHash,
        uint256 _authenticityScore,
        string calldata _healthAssessment
    ) external onlyAPIHandler returns (uint256) {
        require(_userWallet != address(0), "Invalid wallet address");
        require(bytes(_treeSpecies).length > 0, "Tree species required");
        require(bytes(_photoIPFSHash).length > 0, "IPFS hash required");
        require(_authenticityScore <= 100, "Invalid authenticity score");
        
        uint256 updateId = nextTreeUpdateId++;
        
        TreeUpdate storage update = treeUpdates[updateId];
        update.id = updateId;
        update.userWallet = _userWallet;
        update.treeSpecies = _treeSpecies;
        update.latitude = _latitude;
        update.longitude = _longitude;
        update.altitude = _altitude;
        update.photoIPFSHash = _photoIPFSHash;
        update.timestamp = block.timestamp;
        update.authenticity_score = _authenticityScore;
        update.healthAssessment = _healthAssessment;
        
        userTreeUpdateIds[_userWallet].push(updateId);
        
        emit TreeUpdateRecorded(
            updateId,
            _userWallet,
            _treeSpecies,
            _latitude,
            _longitude,
            _photoIPFSHash,
            block.timestamp
        );
        
        return updateId;
    }
    
    /// @notice Internal function to update user impact statistics
    function _updateUserImpact(address _userWallet, uint256 _pointsAdded, uint256 _treesAdded) internal {
        UserImpact storage impact = userImpact[_userWallet];
        
        impact.userWallet = _userWallet;
        impact.totalPoints += _pointsAdded;
        impact.totalTrees += _treesAdded;
        impact.totalCertifications = userCertificateIds[_userWallet].length;
        impact.lastUpdated = block.timestamp;
        impact.hasBlockchainRecord = true;
        
        emit UserImpactUpdated(
            _userWallet,
            impact.totalPoints,
            impact.totalTrees,
            impact.totalCertifications
        );
    }
    
    /// @notice Get all certificates for a user
    function getUserCertificates(address _userWallet) external view returns (uint256[] memory) {
        return userCertificateIds[_userWallet];
    }
    
    /// @notice Get all tree updates for a user
    function getUserTreeUpdates(address _userWallet) external view returns (uint256[] memory) {
        return userTreeUpdateIds[_userWallet];
    }
    
    /// @notice Get a specific certificate
    function getCertificate(uint256 _certId) external view returns (CertificateRecord memory) {
        return certificates[_certId];
    }
    
    /// @notice Get a specific tree update
    function getTreeUpdate(uint256 _updateId) external view returns (TreeUpdate memory) {
        return treeUpdates[_updateId];
    }
    
    /// @notice Get user's impact summary
    function getUserImpactSummary(address _userWallet) external view returns (UserImpact memory) {
        return userImpact[_userWallet];
    }
}
