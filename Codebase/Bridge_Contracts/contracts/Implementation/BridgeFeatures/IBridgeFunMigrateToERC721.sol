// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

/// @notice The well-ordered memory structure of our bridge. Used for generating proper memory address at compilation.
interface IBridgeFunMigrateToERC721 {
    // Event emitted when an ERC-721 IOU migration is registered.
    // Indexed parameter will be included into the transaction logs, hence being usable to programmaticaly parse them and query them through RPC
    event MigrationDeparturePreRegisteredERC721IOU(
        address indexed _originWorld,
        uint256 indexed _originTokenId,
        address _originOwner,
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee,
        bytes32 indexed _migrationHash //Depend on all previous elements + _originWorld + isIOU
    );

    // Event emitted when an ERC-721 IOU migration is registered.
    // Indexed parameter will be included into the transaction logs, hence being usable to programmaticaly parse them and query them through RPC
    event MigrationDeparturePreRegisteredERC721Full(
        address indexed _originWorld,
        uint256 indexed _originTokenId,
        address _originOwner,
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee,
        bytes32 indexed _migrationHash //Depend on all previous elements + _originWorld + isNotIOU
    );

    /// @notice Declare the intent to migrate an ERC-721 token to a different bridge as an IOU token.
    /// Calling this functionIt will assume that the migrating owner is the current owner at function call.
    /// @dev Throw if _originWorld owner disabled IOU migrations for this world.
    /// Emit MigrationDeparturePreRegisteredERC721IOU
    /// Can be called by the owner of the ERC-721 token or one of it's operator/approved address
    /// The latest migration data would be bound to a token when the token is deposited in escrow
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
    function migrateToERC721IOU(
        address _originWorld,
        uint256 _originTokenId,
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee
    ) external;

    /// @notice Declare the intent to migrate an ERC-721 token to a different bridge as a full migration.
    /// Calling this functionIt will assume that the migrating owner is the current owner at function call.
    /// @dev Throw if _originWorld owner has not set (_destinationUniverse, _destinationWorld) as an accepted
    /// migration.
    /// Will callback onFullMigration(_destinationWorld, _destinationTokenId);
    /// Emit MigrationDeparturePreRegisteredERC721Full
    /// Can be called by the owner of the ERC-721 token or one of it's operator/approved address
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
    function migrateToERC721Full(
        address _originWorld,
        uint256 _originTokenId,
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee
    ) external;

    /// @notice Query if a migration generating the given hash has been registered.
    /// @param _migrationHash The bytes32 migrationHash that would have been generated when pre-registering the migration
    /// @return TRUE if a migration generating such a hash was pre registered, FALSE if not.
    function isMigrationPreRegisteredERC721(bytes32 _migrationHash)
        external
        view
        returns (bool);

    /// @notice Get the latest proof of escrow hash associated with a migration hash.
    /// @dev Throw if the token has not been deposited yet. To prevent front running, please wrap the safeTransfer transaction
    /// and check the deposit using this function.
    /// @param _migrationHash The bytes32 migrationHash that was generated when pre-registering the migration
    /// @return The proof of escrowHash associated with a migration (if any)
    function getProofOfEscrowHash(bytes32 _migrationHash)
        external
        view
        returns (bytes32);

    /// @notice Check if an origin NFT token can be migrated to a different token as an IOU migration
    /// @param _originWorld The smart contract address of the token currently representing the NFT
    /// _param _originTokenId The token ID of the token representing the NFT
    /// _param _destinationUniverse An array of 32 bytes representing the destination universe.
    /// eg : "Ropsten", "Moonbeam". Please refer to the documentation for a standardized list of destination.
    /// _param _destinationWorld An array of 32 bytes representing the destination world of the migrated token.
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// _param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token.
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @return TRUE if token can be migrated, FALSE if it can't.
    function acceptedMigrationDestinationERC721IOU(
        address _originWorld,
        uint256, /*_originTokenId*/
        bytes32, /*_destinationUniverse*/
        bytes32, /*_destinationWorld*/
        bytes32 /*_destinationTokenId*/
    ) external view returns (bool);

    /// @notice Check if an origin NFT token can be migrated to a different token as a full migration
    /// @param _originWorld The smart contract address of the token currently representing the NFT
    /// @param _originTokenId The token ID of the token representing the NFT
    /// @param _destinationUniverse An array of 32 bytes representing the destination universe.
    /// eg : "Ropsten", "Moonbeam". Please refer to the documentation for a standardized list of destination.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token.
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token.
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @return TRUE if token can be migrated, FALSE if it can't.
    function acceptedMigrationDestinationERC721Full(
        address _originWorld,
        uint256 _originTokenId,
        bytes32 _destinationUniverse,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId
    ) external view returns (bool);

    /// @notice Generate a hash that would be generated when registering an IOU ERC721 migration
    /// @param _originUniverse The bytes32 identifier of the Universe this bridge is deployed in
    /// @param _originBridge the address of bridge the original token is gonna be in escrow with
    /// @param _originWorld The smart contract address of the original token representing the NFT
    /// @param _originTokenId The token ID of the original token representing the NFT
    /// @param _originOwner The original owner of the token when migration is registered
    /// @param _destinationUniverse An array of 32 bytes representing the destination universe.
    /// eg : "Ropsten", "Moonbeam". Please refer to the documentation for a standardized list of destination.
    /// @param _destinationBridge An array of 32 bytes representing the destination bridge of the migrated token.
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token.
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token.
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _destinationOwner  An array of 32 bytes representing the final owner of the migrated token .
    /// If the destination world is on an EVM, it is most likely an address.
    /// @param _signee The address that will be verified as signing the transfer as legitimate on the destination
    /// If the owner has access to a private key, it should be the owner.
    /// @param _originHeight The height of the origin universe (usually block.timestamp)
    /// If the owner has access to a private key, it should be the owner.
    /// @return The bytes32 migrationHash that would be generated in such a migration
    function generateMigrationHashERC721IOU(
        bytes32 _originUniverse,
        address _originBridge,
        address _originWorld,
        uint256 _originTokenId,
        address _originOwner,
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee,
        bytes32 _originHeight
    ) external pure returns (bytes32);

    /// @notice Generate a hash that would be also generated when registering an IOU ERC721 migration with the same data
    /// @param _originUniverse The bytes32 identifier of the Universe this bridge is deployed in
    /// @param _originBridge the address of bridge the original token is gonna be in escrow with
    /// @param _originWorld The smart contract address of the original token representing the NFT
    /// @param _originTokenId The token ID of the original token representing the NFT
    /// @param _originOwner The original owner of the token when migration is registered
    /// @param _destinationUniverse An array of 32 bytes representing the destination universe.
    /// eg : "Ropsten", "Moonbeam". Please refer to the documentation for a standardized list of destination.
    /// @param _destinationBridge An array of 32 bytes representing the destination bridge of the migrated token.
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token.
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token.
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _destinationOwner  An array of 32 bytes representing the final owner of the migrated token .
    /// If the destination world is on an EVM, it is most likely an address.
    /// @param _signee The address that will be verified as signing the transfer as legitimate on the destination
    /// If the owner has access to a private key, it should be the owner.
    /// @param _originHeight The height of the origin universe (usually block.timestamp)
    /// If the owner has access to a private key, it should be the owner.
    /// @return The bytes32 migrationHash that would be generated in such a migration
    function generateMigrationHashERC721Full(
        bytes32 _originUniverse,
        address _originBridge,
        address _originWorld,
        uint256 _originTokenId,
        address _originOwner,
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee,
        bytes32 _originHeight
    ) external pure returns (bytes32);
}
