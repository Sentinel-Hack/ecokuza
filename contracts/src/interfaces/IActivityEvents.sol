// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IActivityEvents - Interface for activity-related events
interface IActivityEvents {
    event ActivityRecorded(
        uint256 indexed activityId,
        uint256 indexed clubId,
        uint8 activityType,
        string species,
        uint32 count,
        string locationCode,
        uint256 pointsAwarded,
        string metadataURI
    );
    
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
}