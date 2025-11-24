// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Structs - Common data structures used across contracts
library Structs {
    
    enum ActivityType {
        Planting,
        GrowthCheck,
        Cleanup,
        BiodiversityLog
    }
    
    struct Club {
        uint256 id;
        address wallet;
        string name;
        string schoolName;
        string county;
        string region;
        uint256 totalPoints;
        uint256 totalTrees;
        bool active;
        uint64 registrationDate;
    }
    
    struct Activity {
        uint256 id;
        uint256 clubId;
        ActivityType activityType;
        string species;
        uint32 count;
        string locationCode;
        uint64 timestamp;
        string metadataURI;
        uint256 pointsAwarded;
        bool verified;
    }
    
    struct ActivityVerification {
        address verifier;
        uint64 timestamp;
        bool approved;
        string comments;
    }
    
    struct LocationStats {
        uint256 totalTrees;
        uint256 totalActivities;
        uint256 lastActivity;
    }
    
    struct LeaderboardEntry {
        uint256 clubId;
        string clubName;
        string schoolName;
        string county;
        uint256 totalPoints;
        uint256 totalTrees;
        uint256 rank;
    }
}