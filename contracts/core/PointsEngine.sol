// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../utils/Structs.sol";

/// @title PointsEngine - Calculates and manages points system for activities
contract PointsEngine {
    
    address public owner;
    
    // Points configuration
    mapping(ActivityType => uint256) public basePoints;
    mapping(string => uint256) public speciesMultiplier; // species -> multiplier (percentage)
    mapping(ActivityType => uint256) public verificationBonus;
    
    // Season tracking
    uint256 public currentSeason;
    mapping(uint256 => mapping(uint256 => uint256)) public seasonPoints; // season -> clubId -> points
    
    event PointsCalculated(
        uint256 indexed activityId,
        uint256 basePoints,
        uint256 speciesBonus,
        uint256 totalPoints
    );
    
    event SeasonStarted(uint256 indexed seasonId, uint256 startTime);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        currentSeason = 1;
        
        // Initialize base points
        basePoints[ActivityType.Planting] = 10;
        basePoints[ActivityType.GrowthCheck] = 5;
        basePoints[ActivityType.Cleanup] = 3;
        basePoints[ActivityType.BiodiversityLog] = 4;
        
        // Initialize species multipliers (100 = 1x, 150 = 1.5x)
        speciesMultiplier["Native"] = 150;
        speciesMultiplier["Fruit"] = 120;
        speciesMultiplier["Mixed"] = 100;
        
        // Initialize verification bonuses
        verificationBonus[ActivityType.Planting] = 5;
        verificationBonus[ActivityType.GrowthCheck] = 3;
    }

    /// @notice Calculate points for an activity
    function calculatePoints(
        ActivityType _activityType,
        uint32 _count,
        string calldata _species
    ) external view returns (uint256) {
        uint256 base = basePoints[_activityType] * _count;
        uint256 multiplier = speciesMultiplier[_species];
        if (multiplier == 0) multiplier = 100; // Default multiplier
        
        uint256 totalPoints = (base * multiplier) / 100;
        
        return totalPoints;
    }

    /// @notice Calculate verification bonus points
    function calculateVerificationBonus(ActivityType _activityType, uint32 _count) 
        external 
        view 
        returns (uint256) 
    {
        return verificationBonus[_activityType] * _count;
    }

    /// @notice Record points for a season
    function recordSeasonPoints(uint256 _clubId, uint256 _points) external {
        seasonPoints[currentSeason][_clubId] += _points;
    }

    /// @notice Get season leaderboard
    function getSeasonLeaderboard(uint256 _seasonId, uint256 _limit) 
        external 
        view 
        returns (uint256[] memory, uint256[] memory) 
    {
        // This would require additional storage for efficient sorting
        // For MVP, return top clubs (implementation depends on your needs)
        uint256[] memory clubIds = new uint256[](_limit);
        uint256[] memory points = new uint256[](_limit);
        
        return (clubIds, points);
    }

    /// @notice Start a new season
    function startNewSeason() external onlyOwner {
        currentSeason++;
        emit SeasonStarted(currentSeason, block.timestamp);
    }

    /// @notice Update base points for an activity type
    function updateBasePoints(ActivityType _activityType, uint256 _newPoints) external onlyOwner {
        basePoints[_activityType] = _newPoints;
    }

    /// @notice Update species multiplier
    function updateSpeciesMultiplier(string calldata _species, uint256 _multiplier) external onlyOwner {
        speciesMultiplier[_species] = _multiplier;
    }
}