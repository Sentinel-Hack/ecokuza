// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ClubBadge - Achievement badges for 4K Clubs
/// @notice ERC1155 tokens representing club achievements and milestones
contract ClubBadge is ERC1155, Ownable {
    
    // Badge types
    uint256 public constant BRONZE_BADGE = 0;
    uint256 public constant SILVER_BADGE = 1;
    uint256 public constant GOLD_BADGE = 2;
    uint256 public constant PLANTING_CHAMPION = 3;
    uint256 public constant GROWTH_EXPERT = 4;
    uint256 public constant BIODIVERSITY_GUARDIAN = 5;
    
    struct BadgeInfo {
        string name;
        string description;
        string imageURI;
        uint256 pointsRequired;
    }
    
    mapping(uint256 => BadgeInfo) public badgeInfo;
    mapping(uint256 => mapping(uint256 => bool)) public clubBadges; // clubId -> badgeId -> hasBadge
    
    event BadgeAwarded(
        uint256 indexed clubId,
        uint256 badgeId,
        uint256 awardDate
    );

    constructor() ERC1155("") Ownable(msg.sender) {
        // Initialize badge information
        badgeInfo[BRONZE_BADGE] = BadgeInfo({
            name: "Bronze Badge",
            description: "Awarded for basic conservation efforts",
            imageURI: "ipfs://Qmbadge1",
            pointsRequired: 100
        });
        
        badgeInfo[SILVER_BADGE] = BadgeInfo({
            name: "Silver Badge",
            description: "Awarded for consistent environmental work",
            imageURI: "ipfs://Qmbadge2",
            pointsRequired: 500
        });
        
        badgeInfo[GOLD_BADGE] = BadgeInfo({
            name: "Gold Badge",
            description: "Awarded for exceptional conservation leadership",
            imageURI: "ipfs://Qmbadge3",
            pointsRequired: 2000
        });
        
        badgeInfo[PLANTING_CHAMPION] = BadgeInfo({
            name: "Planting Champion",
            description: "Awarded for planting 100+ trees",
            imageURI: "ipfs://Qmbadge4",
            pointsRequired: 0 // Special badge based on trees, not points
        });
        
        badgeInfo[GROWTH_EXPERT] = BadgeInfo({
            name: "Growth Expert",
            description: "Awarded for monitoring 50+ growth activities",
            imageURI: "ipfs://Qmbadge5",
            pointsRequired: 0
        });
        
        badgeInfo[BIODIVERSITY_GUARDIAN] = BadgeInfo({
            name: "Biodiversity Guardian",
            description: "Awarded for documenting 20+ species",
            imageURI: "ipfs://Qmbadge6",
            pointsRequired: 0
        });
    }

    /// @notice Award a badge to a club
    function awardBadge(
        uint256 _clubId,
        uint256 _badgeId,
        address _clubWallet
    ) external onlyOwner {
        require(!clubBadges[_clubId][_badgeId], "Badge already awarded");
        
        clubBadges[_clubId][_badgeId] = true;
        _mint(_clubWallet, _badgeId, 1, "");
        
        emit BadgeAwarded(_clubId, _badgeId, block.timestamp);
    }

    /// @notice Check if club has a specific badge
    function hasBadge(uint256 _clubId, uint256 _badgeId) external view returns (bool) {
        return clubBadges[_clubId][_badgeId];
    }

    /// @notice Get all badges for a club
    function getClubBadges(uint256 _clubId) external view returns (uint256[] memory) {
        uint256 badgeCount = 0;
        
        // Count badges
        for (uint256 i = 0; i <= BIODIVERSITY_GUARDIAN; i++) {
            if (clubBadges[_clubId][i]) {
                badgeCount++;
            }
        }
        
        // Create result array
        uint256[] memory badges = new uint256[](badgeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i <= BIODIVERSITY_GUARDIAN; i++) {
            if (clubBadges[_clubId][i]) {
                badges[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return badges;
    }

    /// @notice Override URI for badge metadata
    function uri(uint256 _badgeId) 
        public 
        view 
        virtual 
        override 
        returns (string memory) 
    {
        return badgeInfo[_badgeId].imageURI;
    }

    /// @notice Update badge metadata
    function updateBadgeInfo(
        uint256 _badgeId,
        string calldata _imageURI,
        string calldata _description
    ) external onlyOwner {
        badgeInfo[_badgeId].imageURI = _imageURI;
        badgeInfo[_badgeId].description = _description;
    }
}