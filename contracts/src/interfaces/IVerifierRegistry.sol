// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IVerifierRegistry - Interface for verifier management
interface IVerifierRegistry {
    
    function addVerifier(
        address _verifier,
        string calldata _organization,
        string calldata _role
    ) external;
    
    function removeVerifier(address _verifier) external;
    
    function updateVerifierStatus(address _verifier, bool _active) external;
    
    function recordVerification(address _verifier) external;
    
    function isActiveVerifier(address _verifier) external view returns (bool);
    
    function getActiveVerifiers() external view returns (address[] memory);
}