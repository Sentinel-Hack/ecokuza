// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../registry/ClubRegistry.sol";
import "../utils/Structs.sol";
import "../utils/IClubEvents.sol";
import "../interfaces/IPointsEngine.sol";

/// @title SentinelClubs - Main contract for 4K Club activities and tracking
/// @notice Handles club activities, tree planting, growth monitoring, and points system
contract SentinelClubs is ClubRegistry, IClubEvents {
    
    IPointsEngine public pointsEngine;
    
    // Activity tracking
    uint256 public nextActivityId = 1;
    mapping(uint256 => Structs.Activity) public activities;
    mapping(uint256 => uint256[]) public clubActivities; // clubId -> activityIds
    
    // Tree species tracking
    mapping(uint256 => mapping(string => uint256)) public clubSpeciesCount; // clubId -> species -> count
    
    // Location tracking
    mapping(string => Structs.LocationStats) public locationStats; // locationCode -> stats
    
    constructor(address _pointsEngine) {
        pointsEngine = IPointsEngine(_pointsEngine);
    }

    /// @notice Record a new activity (tree planting, growth check, etc.)
    function recordActivity(
        Structs.ActivityType _activityType,
        string calldata _species,
        uint32 _count,
        string calldata _locationCode,
        string calldata _metadataURI
    ) external returns (uint256) {
        uint256 clubId = clubIdByWallet[msg.sender];
        require(clubId != 0, "Not a registered club");
        require(clubs[clubId].active, "Club inactive");
        require(_count > 0, "Count must be positive");
        require(bytes(_locationCode).length > 0, "Location required");

        uint256 activityId = nextActivityId++;
        
        Structs.Activity memory newActivity = Structs.Activity({
            id: activityId,
            clubId: clubId,
            activityType: _activityType,
            species: _species,
            count: _count,
            locationCode: _locationCode,
            timestamp: uint64(block.timestamp),
            metadataURI: _metadataURI,
            pointsAwarded: 0,
            verified: false
        });

        activities[activityId] = newActivity;
        clubActivities[clubId].push(activityId);

        // Update species count for planting activities
        if (_activityType == Structs.ActivityType.Planting) {
            clubSpeciesCount[clubId][_species] += _count;
            clubs[clubId].totalTrees += _count;
        }

        // Update location stats
        _updateLocationStats(_locationCode, _activityType, _count);

        // Calculate and award points
        uint256 points = pointsEngine.calculatePoints(_activityType, _count, _species);
        activities[activityId].pointsAwarded = points;
        clubs[clubId].totalPoints += points;

        emit ActivityRecorded(
            activityId,
            clubId,
            _activityType,
            _species,
            _count,
            _locationCode,
            points,
            _metadataURI
        );

        return activityId;
    }

    /// @notice Verify an activity (only verifiers or owner)
    function verifyActivity(uint256 _activityId, bool _verified) external onlyOwnerOrVerifier {
        activities[_activityId].verified = _verified;
        
        if (_verified) {
            Structs.Activity storage activity = activities[_activityId];
            uint256 bonusPoints = pointsEngine.calculateVerificationBonus(activity.activityType, activity.count);
            
            if (bonusPoints > 0) {
                clubs[activity.clubId].totalPoints += bonusPoints;
                activity.pointsAwarded += bonusPoints;
            }
        }
    }

    /// @notice Get all activities for a club
    function getClubActivities(uint256 _clubId) external view returns (Structs.Activity[] memory) {
        uint256[] memory activityIds = clubActivities[_clubId];
        Structs.Activity[] memory clubActivitiesList = new Structs.Activity[](activityIds.length);
        
        for (uint256 i = 0; i < activityIds.length; i++) {
            clubActivitiesList[i] = activities[activityIds[i]];
        }
        
        return clubActivitiesList;
    }

    /// @notice Get species distribution for a club
    function getClubSpeciesDistribution(uint256 _clubId) external view returns (string[] memory, uint256[] memory) {
        // This would require additional storage for species list per club
        // For MVP, we return the main species counts
        string[] memory species = new string[](3); // Example - adjust based on your species
        uint256[] memory counts = new uint256[](3);
        
        // Implementation depends on how you track species per club
        return (species, counts);
    }

    /// @notice Update location statistics
    function _updateLocationStats(string calldata _locationCode, Structs.ActivityType _activityType, uint32 _count) internal {
        Structs.LocationStats storage stats = locationStats[_locationCode];
        stats.totalActivities++;
        
        if (_activityType == Structs.ActivityType.Planting) {
            stats.totalTrees += _count;
        }
        
        stats.lastActivity = block.timestamp;
        
        emit LocationUpdated(_locationCode, stats.totalTrees, stats.totalActivities);
    }

    /// @notice Get location statistics
    function getLocationStats(string calldata _locationCode) external view returns (Structs.LocationStats memory) {
        return locationStats[_locationCode];
    }

    /// @notice Award bonus points to a club
    function awardBonusPoints(
        uint256 _clubId,
        uint256 _points,
        string calldata _reason
    ) external onlyOwnerOrVerifier {
        require(_points > 0, "Points must be > 0");
        require(clubs[_clubId].id != 0, "Club not found");

        clubs[_clubId].totalPoints += _points;

        emit PointsAwarded(_clubId, _points, _reason);
    }
}