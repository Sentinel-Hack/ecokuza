// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../utils/Structs.sol";

/// @title ISentinelClubs - Interface for Sentinel Clubs main contract
interface ISentinelClubs {
    
    function recordActivity(
        uint8 _activityType,
        string calldata _species,
        uint32 _count,
        string calldata _locationCode,
        string calldata _metadataURI
    ) external returns (uint256);
    
    function verifyActivity(uint256 _activityId, bool _verified) external;
    
    function getClubActivities(uint256 _clubId) 
        external 
        view 
        returns (Structs.Activity[] memory);
    
    function getLocationStats(string calldata _locationCode) 
        external 
        view 
        returns (Structs.LocationStats memory);
}