// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title VerifierRegistry - Manages NGO and verifier accounts
contract VerifierRegistry {
    
    address public owner;
    
    struct Verifier {
        address wallet;
        string organization;
        string role;
        bool active;
        uint256 verificationCount;
        uint256 addedDate;
    }
    
    mapping(address => Verifier) public verifiers;
    address[] public verifierList;
    
    event VerifierAdded(
        address indexed verifier,
        string organization,
        string role
    );
    
    event VerifierRemoved(address indexed verifier);
    event VerifierUpdated(address indexed verifier, bool active);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Add a new verifier (NGO staff, government, etc.)
    function addVerifier(
        address _verifier,
        string calldata _organization,
        string calldata _role
    ) external onlyOwner {
        require(_verifier != address(0), "Invalid address");
        require(!verifiers[_verifier].active, "Already a verifier");

        verifiers[_verifier] = Verifier({
            wallet: _verifier,
            organization: _organization,
            role: _role,
            active: true,
            verificationCount: 0,
            addedDate: block.timestamp
        });

        verifierList.push(_verifier);
        emit VerifierAdded(_verifier, _organization, _role);
    }

    /// @notice Remove a verifier
    function removeVerifier(address _verifier) external onlyOwner {
        require(verifiers[_verifier].active, "Not an active verifier");
        
        verifiers[_verifier].active = false;
        emit VerifierRemoved(_verifier);
    }

    /// @notice Update verifier status
    function updateVerifierStatus(address _verifier, bool _active) external onlyOwner {
        verifiers[_verifier].active = _active;
        emit VerifierUpdated(_verifier, _active);
    }

    /// @notice Record a verification (called by other contracts)
    function recordVerification(address _verifier) external {
        require(verifiers[_verifier].active, "Not an active verifier");
        verifiers[_verifier].verificationCount++;
    }

    /// @notice Get all active verifiers
    function getActiveVerifiers() external view returns (address[] memory) {
        uint256 activeCount = 0;
        
        // Count active verifiers
        for (uint256 i = 0; i < verifierList.length; i++) {
            if (verifiers[verifierList[i]].active) {
                activeCount++;
            }
        }
        
        // Create result array
        address[] memory activeVerifiers = new address[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < verifierList.length; i++) {
            if (verifiers[verifierList[i]].active) {
                activeVerifiers[currentIndex] = verifierList[i];
                currentIndex++;
            }
        }
        
        return activeVerifiers;
    }

    /// @notice Check if address is an active verifier
    function isActiveVerifier(address _verifier) external view returns (bool) {
        return verifiers[_verifier].active;
    }
}