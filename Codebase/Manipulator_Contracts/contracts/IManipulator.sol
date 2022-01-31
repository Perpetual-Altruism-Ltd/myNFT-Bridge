// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

interface IManipulator {
    function init() external;

    function approve(address _address, bool _allowed) external;

    function mintedTokens(address _contractAddress) external returns (uint256);

    function mint(address _contractAddress) external returns (uint256);

    function setTokenUri(
        uint256 _tokenId,
        string calldata _tokenUri,
        address _contractAddress
    ) external;

    function tokenURI(uint256 _tokenId, address _contractAddress)
        external
        returns (string memory);

    function premintFor(address _preminter, address _contractAddress)
        external
        returns (uint256);

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        address _contractAddress
    ) external;

    function getProofOfEscrowHash(
        bytes32 _migrationHash,
        address _contractAddress
    ) external returns (bytes32);

    function migrateToERC721IOU(
        address _originWorld
        , uint256 _originTokenId
        , bytes32 _destinationUniverse
        , bytes32 _destinationBridge
        , bytes32 _destinationWorld
        , bytes32 _destinationTokenId
        , bytes32 _destinationOwner
        , bytes32 _signee
        , address _contractAddress
        ) external returns (string memory);
    
    function registerEscrowHashSignature(
        bytes32 _migrationHash
        , bytes calldata _escrowHashSigned
        , address _contractAddress
        ) external;

    function migrateFromIOUERC721ToERC721(bytes calldata _data, address _contractAddress) external;

    function cancelMigration(
        address _originWorld, 
        uint256 _originTokenId, 
        address _originOwner,
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        address _signee,
        bytes32 _originHeight,
        address _contractAddress
    ) external;
}
