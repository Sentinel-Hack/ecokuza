// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../utils/Structs.sol";
import "../utils/IClubEvents.sol";

/// @title ClubRegistry - Manages 4K Club registration and data
contract ClubRegistry {
    
    address public owner;
    
    uint256 public nextClubId = 1;
    mapping(uint256 => Structs.Club) public clubs;
    mapping(address => uint256) public clubIdByWallet;
    mapping(string => bool) public registeredSchools; // schoolName -> registered
    
    // County and region tracking
    mapping(string => uint256) public countyClubCount; // county -> club count
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyOwnerOrVerifier() {
        require(msg.sender == owner || verifiers[msg.sender], "Not authorized");
        _;
    }

    mapping(address => bool) public verifiers;

    constructor() {
        owner = msg.sender;
    }

    /// @notice Register a new 4K Club
    function registerClub(
        address _wallet,
        string calldata _name,
        string calldata _schoolName,
        string calldata _county,
        string calldata _region
    ) external onlyOwner returns (uint256) {
        require(_wallet != address(0), "Invalid wallet");
        require(clubIdByWallet[_wallet] == 0, "Wallet already registered");
        require(!registeredSchools[_schoolName], "School already registered");
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_county).length > 0, "County required");

        uint256 clubId = nextClubId++;
        
        clubs[clubId] = Structs.Club({
            id: clubId,
            wallet: _wallet,
            name: _name,
            schoolName: _schoolName,
            county: _county,
            region: _region,
            totalPoints: 0,
            totalTrees: 0,
            active: true,
            registrationDate: uint64(block.timestamp)
        });

        clubIdByWallet[_wallet] = clubId;
        registeredSchools[_schoolName] = true;
        countyClubCount[_county]++;

        emit ClubRegistered(clubId, _wallet, _name, _schoolName, _county, _region);
        return clubId;
    }

    /// @notice Update club information
    function updateClub(
        uint256 _clubId,
        string calldata _newName,
        bool _active
    ) external onlyOwner {
        Structs.Club storage club = clubs[_clubId];
        require(club.id != 0, "Club not found");
        
        club.name = _newName;
        club.active = _active;
        
        emit ClubUpdated(_clubId, _newName, _active);
    }

    /// @notice Get club count by county
    function getCountyStats(string calldata _county) external view returns (uint256) {
        return countyClubCount[_county];
    }

    /// @notice Get all clubs (with pagination for large datasets)
    function getClubs(uint256 _start, uint256 _limit) 
        external 
        view 
        returns (Structs.Club[] memory) 
    {
        uint256 end = _start + _limit;
        if (end > nextClubId) end = nextClubId;
        
        uint256 resultCount = end - _start;
        Structs.Club[] memory result = new Structs.Club[](resultCount);
        
        for (uint256 i = _start; i < end; i++) {
            result[i - _start] = clubs[i];
        }
        
        return result;
    }

    /// @notice Add verifier
    function addVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = true;
    }

    /// @notice Remove verifier
    function removeVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = false;
    }

    /// @notice Transfer ownership
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid owner");
        owner = _newOwner;
    }
}