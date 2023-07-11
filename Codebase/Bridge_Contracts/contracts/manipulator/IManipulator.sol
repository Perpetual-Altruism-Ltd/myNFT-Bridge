// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

/// @notice A proxy smart contract that allow multiple relays (addresses) to call
/// any smart contracts implementing Bridge or IOU interfaces
interface IManipulator {
    /// @notice Initiate the owner of the contract
    function init(address _owner) external;

    /// @notice Set or reaffirm the approved address for this proxy smart contract
    /// @dev Throws unless `msg.sender` is the current smart contract owner
    /// @param _address The new approved proxy caller
    /// @param _allowed True if the operator is approved, false to revoke approval
    function approve(address _address, bool _allowed) external;

    /*
     *   Manipulate an IOU contract
     */

    /// @notice Call mintedTokens() function from another contract
    /// @param _contractAddress The address of the remote contract
    function mintedTokens(address _contractAddress) external returns (uint256);

    /// @notice Call mint() function from another contract
    /// @param _contractAddress The address of the remote contract
    function mint(address _contractAddress) external returns (uint256);

    /// @notice Call setTokenUri() function from another contract
    /// @param _tokenId The id of the token that we want to set
    /// @param _tokenUri The new URI of the token
    /// @param _contractAddress The address of the remote contract
    function setTokenUri(
        uint256 _tokenId,
        string calldata _tokenUri,
        address _contractAddress
    ) external;

    /// @notice Call tokenURI() function from another contract
    /// @param _tokenId The id of the token that we want to get
    /// @param _contractAddress The address of the remote contract
    function tokenURI(uint256 _tokenId, address _contractAddress)
        external
        returns (string memory);

    /// @notice Call premintFor() function from another contract
    /// @param _preminter The address of the premint user
    /// @param _contractAddress The address of the remote contract
    function premintFor(address _preminter, address _contractAddress)
        external
        returns (uint256);

    /// @notice Call safeTransferFrom() function from another contract
    /// @param _from The address of the previous owner of the token
    /// @param _to The address of the new owner of the token
    /// @param _tokenId The id of the token that is traded
    /// @param _contractAddress The address of the remote contract
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        address _contractAddress
    ) external;

    /*
     *   Manipulate a bridge
     */

    /// @notice Call getProofOfEscrowHash() function from another contract
    /// Get the proof of escrow hash associated with a migration hash.
    /// @param _migrationHash The bytes32 migrationHash that was generated when pre-registering the migration
    /// @param _contractAddress The address of the remote contract
    /// @return The proof of escrowHash associated with a migration (if any)
    function getProofOfEscrowHash(
        bytes32 _migrationHash,
        address _contractAddress
    ) external returns (bytes32);

    /// @notice Call migrateToERC721IOU() function from another contract
    /// Declare the intent to migrate an ERC-721 token to a different bridge as an IOU token.
    /// Calling this functionIt will assume that the migrating owner is the current owner at function call.
    /// @param _originWorld The smart contract address of the token currently representing the NFT
    /// @param _originTokenId The token ID of the token representing the NFT
    /// @param _destinationUniverse An array of 32 bytes representing the destination universe.
    /// eg : "Ropsten", "Moonbeam". Please refer to the documentation for a standardized list of destination.
    /// @param _destinationBridge An array of 32 bytes representing the destination bridge. If the destination
    /// bridge is on an EVM, it is most likely an address.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token.
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token.
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _destinationOwner An array of 32 bytes representing the final owner of the migrated token .
    /// If the destination world is on an EVM, it is most likely an address.
    /// @param _signee The address that will be verified as signing the transfer as legitimate on the destination
    /// If the owner has access to a private key, it should be the owner.
    /// @param _contractAddress The address of the remote contract
    function migrateToERC721IOU(
        address _originWorld,
        uint256 _originTokenId,
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee,
        address _contractAddress
    ) external returns (string memory);

    /// @notice Call migrateToERC721IOU() function from another contract
    /// Declare the intent to migrate an ERC-721 token to a different bridge as an IOU token.
    /// Calling this functionIt will assume that the migrating owner is the current owner at function call.
    /// @param _originWorld The smart contract address of the token currently representing the NFT
    /// @param _originTokenId The token ID of the token representing the NFT
    /// @param _destinationUniverse An array of 32 bytes representing the destination universe.
    /// eg : "Ropsten", "Moonbeam". Please refer to the documentation for a standardized list of destination.
    /// @param _destinationBridge An array of 32 bytes representing the destination bridge. If the destination
    /// bridge is on an EVM, it is most likely an address.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token.
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token.
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _destinationOwner An array of 32 bytes representing the final owner of the migrated token .
    /// If the destination world is on an EVM, it is most likely an address.
    /// @param _signee The address that will be verified as signing the transfer as legitimate on the destination
    /// If the owner has access to a private key, it should be the owner.
    /// @param _contractAddress The address of the remote contract
    function migrateToERC721Full(
        address _originWorld,
        uint256 _originTokenId,
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee,
        address _contractAddress
    ) external returns (string memory);

    /// @notice Call migrateToERC721IOU() function from another contract
    /// Declare the intent to migrate an ERC-721 token to a different bridge as an IOU token.
    /// Calling this functionIt will assume that the migrating owner is the current owner at function call.
    /// @param _originWorld The smart contract address of the token currently representing the NFT
    /// @param _originTokenId The token ID of the token representing the NFT
    /// @param _destinationUniverse An array of 32 bytes representing the destination universe.
    /// eg : "Ropsten", "Moonbeam". Please refer to the documentation for a standardized list of destination.
    /// @param _destinationBridge An array of 32 bytes representing the destination bridge. If the destination
    /// bridge is on an EVM, it is most likely an address.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token.
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token.
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _destinationOwner An array of 32 bytes representing the final owner of the migrated token .
    /// If the destination world is on an EVM, it is most likely an address.
    /// @param _signee The address that will be verified as signing the transfer as legitimate on the destination
    /// If the owner has access to a private key, it should be the owner.
    /// @param _contractAddress The address of the remote contract
    function migrateToERC721FullThenBurn(
        address _originWorld,
        uint256 _originTokenId,
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee,
        address _contractAddress
    ) external returns (string memory);

    /// @notice Call registerEscrowHashSignature() function from another contract
    /// Allow a token deposited to the bridge to be sent to anyone by it's migrating relay
    /// @param _migrationHash The bytes32 migrationHash that was generated when pre-registering the migration
    /// @param _contractAddress The address of the remote contract
    function registerEscrowHashSignature(
        bytes32 _migrationHash,
        bytes calldata _escrowHashSigned,
        address _contractAddress
    ) external;

    /// @notice Call migrateFromIOUERC721ToERC721() function from another contract
    /// @param _data All the parameters considered as a single bytes type input
    /// @param _contractAddress The address of the remote contract
    function migrateFromIOUERC721ToERC721(
        bytes calldata _data,
        address _contractAddress
    ) external;

    /// @notice Call migrateFromIOUERC721ToERC721() function from another contract
    /// @param _data All the parameters considered as a single bytes type input
    /// @param _contractAddress The address of the remote contract
    function migrateFromFullERC721ToERC721(
        bytes calldata _data,
        address _contractAddress
    ) external;


    /// @notice Call cancelMigration() function from another contract
    /// Send back a token to it's previous owner in case a relay do not wish to complete the migration
    /// @param _originWorld An array of 32 bytes representing the origin world of the origin token.
    /// @param _originTokenId An array of 32 bytes representing the tokenId of the origin token.
    /// @param _originOwner An array of 32 bytes representing the original owner of the migrated token .
    /// @param _destinationUniverse  An array of 32 bytes representing the destination universe.
    /// eg : "Ropsten", "Moonbeam". Please refer to the documentation for a standardized list of destination..
    /// @param _destinationBridge An array of 32 bytes representing the origin bridge. If the origin
    /// bridge is on an EVM, it is most likely an address.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token.
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token.
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _destinationOwner An array of 32 bytes representing the final owner of the migrated token .
    /// If the destination world is on an EVM, it is most likely an address.
    /// @param _signee The address that will be verified as signing the transfer as legitimate on the destination
    /// If the owner has access to a private key, it should be the owner.
    /// @param _originHeight The height at which the origin token was put in escrow in this bridge
    /// @param _contractAddress The address of the remote contract
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
