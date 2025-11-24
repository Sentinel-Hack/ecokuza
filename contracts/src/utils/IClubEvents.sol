// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Structs.sol";

/// @title IClubEvents - Interface for club-related events
interface IClubEvents {
    event ClubRegistered(
        uint256 indexed clubId,
        address indexed wallet,
        string name,
        string schoolName,
        string county,
        string region
    );
    
    event ClubUpdated(uint256 indexed clubId, string newName, bool active);
    event ClubStatusChanged(uint256 indexed clubId, bool active);
    
    event ActivityRecorded(
        uint256 indexed activityId,
        uint256 indexed clubId,
        Structs.ActivityType activityType,
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
    
    event PointsAwarded(
        uint256 indexed clubId,
        uint256 points,
        string reason
    );
    
    event LocationUpdated(
        string indexed locationCode,
        uint256 totalTrees,
        uint256 totalActivities
    );
    
    event BonusPointsAwarded(
        uint256 indexed clubId,
        uint256 points,
        string reason
    );
}