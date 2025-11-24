// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../utils/Structs.sol";
import "../utils/IClubEvents.sol";

/// @title Activities - Manages activity lifecycle and verification
contract Activities {
    
    mapping(uint256 => Structs.Activity) public activities;
    mapping(uint256 => Structs.ActivityVerification[]) public activityVerifications;
    
    uint256 public nextActivityId = 1;
    
    address public owner;
    mapping(address => bool) public verifiers;
    
    event ActivityVerified(
        uint256 indexed activityId,
        address indexed verifier,
        bool approved,
        string comments
    );
    
    event ActivityUpdated(
        uint256 indexed activityId,
        string newMetadataURI
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Not verifier");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Create a new activity
    function createActivity(
        uint256 _clubId,
        Structs.ActivityType _activityType,
        string calldata _species,
        uint32 _count,
        string calldata _locationCode,
        string calldata _metadataURI
    ) external returns (uint256) {
        uint256 activityId = nextActivityId++;
        
        activities[activityId] = Structs.Activity({
            id: activityId,
            clubId: _clubId,
            activityType: _activityType,
            species: _species,
            count: _count,
            locationCode: _locationCode,
            timestamp: uint64(block.timestamp),
            metadataURI: _metadataURI,
            pointsAwarded: 0,
            verified: false
        });

        return activityId;
    }

    /// @notice Verify an activity with comments
    function verifyActivity(
        uint256 _activityId,
        bool _approved,
        string calldata _comments
    ) external onlyVerifier {
        Structs.Activity storage activity = activities[_activityId];
        activity.verified = _approved;
        
        activityVerifications[_activityId].push(Structs.ActivityVerification({
            verifier: msg.sender,
            timestamp: uint64(block.timestamp),
            approved: _approved,
            comments: _comments
        }));

        emit ActivityVerified(_activityId, msg.sender, _approved, _comments);
    }

    /// @notice Update activity metadata
    function updateActivityMetadata(
        uint256 _activityId,
        string calldata _newMetadataURI
    ) external {
        Structs.Activity storage activity = activities[_activityId];
        require(activity.clubId != 0, "Activity not found");
        
        activity.metadataURI = _newMetadataURI;
        emit ActivityUpdated(_activityId, _newMetadataURI);
    }

    /// @notice Get verification history for an activity
    function getActivityVerifications(uint256 _activityId) 
        external 
        view 
        returns (Structs.ActivityVerification[] memory) 
    {
        return activityVerifications[_activityId];
    }

    /// @notice Add a new verifier
    function addVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = true;
    }

    /// @notice Remove a verifier
    function removeVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = false;
    }
}