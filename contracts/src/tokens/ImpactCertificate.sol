// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ImpactCertificate - NFT certificates for verified environmental impact
/// @notice ERC721 tokens representing verified tree planting and conservation activities
contract ImpactCertificate is ERC721, Ownable {
    
    uint256 public nextTokenId = 1;
    
    struct CertificateData {
        uint256 clubId;
        uint256 treesPlanted;
        string species;
        string location;
        uint256 impactScore;
        uint256 issueDate;
        string metadataURI;
    }
    
    mapping(uint256 => CertificateData) public certificateData;
    mapping(uint256 => uint256[]) public clubCertificates; // clubId -> tokenIds
    
    event CertificateMinted(
        uint256 indexed tokenId,
        uint256 indexed clubId,
        uint256 treesPlanted,
        uint256 impactScore,
        string metadataURI
    );

    constructor() ERC721("SentinelImpactCertificate", "SIC") Ownable(msg.sender) {}

    /// @notice Mint a new impact certificate for a club
    function mintCertificate(
        address _to,
        uint256 _clubId,
        uint256 _treesPlanted,
        string calldata _species,
        string calldata _location,
        uint256 _impactScore,
        string calldata _metadataURI
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId++;
        
        _mint(_to, tokenId);
        
        certificateData[tokenId] = CertificateData({
            clubId: _clubId,
            treesPlanted: _treesPlanted,
            species: _species,
            location: _location,
            impactScore: _impactScore,
            issueDate: block.timestamp,
            metadataURI: _metadataURI
        });
        
        clubCertificates[_clubId].push(tokenId);
        
        emit CertificateMinted(
            tokenId,
            _clubId,
            _treesPlanted,
            _impactScore,
            _metadataURI
        );
        
        return tokenId;
    }

    /// @notice Get all certificates for a club
    function getClubCertificates(uint256 _clubId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return clubCertificates[_clubId];
    }

    /// @notice Get certificate data
    function getCertificateData(uint256 _tokenId) 
        external 
        view 
        returns (CertificateData memory) 
    {
        require(_exists(_tokenId), "Certificate does not exist");
        return certificateData[_tokenId];
    }

    /// @notice Override tokenURI to point to metadata
    function tokenURI(uint256 _tokenId) 
        public 
        view 
        virtual 
        override 
        returns (string memory) 
    {
        _requireOwned(_tokenId);
        return certificateData[_tokenId].metadataURI;
    }

    /// @notice Check if token exists
    function _exists(uint256 _tokenId) internal view returns (bool) {
        return _ownerOf(_tokenId) != address(0);
    }
}