// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../utils/Structs.sol";

/// @title IPointsEngine - Interface for points calculation engine
interface IPointsEngine {
    
    function calculatePoints(
        Structs.ActivityType _activityType,
        uint32 _count,
        string calldata _species
    ) external view returns (uint256);
    
    function calculateVerificationBonus(
        Structs.ActivityType _activityType,
        uint32 _count
    ) external view returns (uint256);
    
    function recordSeasonPoints(uint256 _clubId, uint256 _points) external;
    
    function getSeasonLeaderboard(uint256 _seasonId, uint256 _limit) 
        external 
        view 
        returns (uint256[] memory, uint256[] memory);
}