// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.2;

import "../ImplMemoryStructure.sol";
import "../ERC721.sol";

/// @author Guillaume Gonnaud 2021
/// @title ImplMyNFTBridgeFunMigrateToERC721
/// @notice The well-ordered memory structure of our bridge. Used for generating proper memory address at compilation.
contract ImplMyNFTBridgeFunMigrateToERC721  is ImplMemoryStructure {

    // Event emitted when an ERC-721 IOU migration is registered. 
    // Indexed parameter suppose that those events are gonna be parsed for checking provenance of a migrated token
    event MigrationDeparturePreRegisteredERC721IOU(
        address _originOwner,
        address indexed _originWorld, 
        uint256 indexed _originTokenId, 
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee,
        bytes32 indexed _migrationHash //Depend on all previous elements + _originWorld + isIOU
    );


    // Event emitted when an ERC-721 IOU migration is registered. 
    // Indexed parameter suppose that those events are gonna be parsed for checking provenance of a migrated token
    event MigrationDeparturePreRegisteredERC721Full(
        address _originOwner,
        address indexed _originWorld, 
        uint256 indexed _originTokenId, 
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
    ) external {
        //Checking token ownership

        //PUSH of tOwner for gas optimization
        address tOwner = ERC721(_originWorld).ownerOf(_originTokenId);
        require(
            msg.sender == tOwner || 
            ERC721(_originWorld).isApprovedForAll(tOwner, msg.sender) ||
            msg.sender == ERC721(_originWorld).getApproved(_originTokenId),
            "msg.sender is not the token owner, an operator, or the accredited address for the token"
        );

        //Checking if IOU migrations are allowed for this world
        require(!isIOUForbidden[_originWorld], "The token creator have forbidden IOU migrations for this world");

        //Generating the migration hash
        bytes32 migrationHash = generateMigrationHash(
            true, //the migration is an IOU migration
            _originWorld,
            _originTokenId,
            _destinationUniverse,
            _destinationBridge,
            _destinationWorld,
            _destinationTokenId,
            _destinationOwner,
            _signee
        );

        require(!migrationsRegistered[migrationHash], "This migration was already registered");

        //Registering the migration as pre-registered
        migrationsRegistered[migrationHash] = true;

        //Registering this migration address as the latest registered for a specific token (hashing less gas expensive than address + tokenID storing)
        latestRegisteredMigration[keccak256(abi.encodePacked(_originWorld, _originTokenId))] = migrationHash;

        //Emiting the registration event
        emit MigrationDeparturePreRegisteredERC721IOU(
            tOwner,
            _originWorld, 
            _originTokenId, 
            _destinationUniverse,
            _destinationBridge,
            _destinationWorld,
            _destinationTokenId,
            _destinationOwner,
            _signee,
            migrationHash
        );
    }


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
    ) external {

        //Checking token ownership


        //PUSH of tOwner for gas optimization
        address tOwner = ERC721(_originWorld).ownerOf(_originTokenId);
        require(
            msg.sender == tOwner || 
            ERC721(_originWorld).isApprovedForAll(tOwner, msg.sender) ||
            msg.sender == ERC721(_originWorld).getApproved(_originTokenId),
            "msg.sender is not the token owner, an operator, or the accredited address for the token"
        );

        //Checking if a FULL migration is allowed for this specific migration
        

        //Generating the migration hash
        bytes32 migrationHash = generateMigrationHash(
            true, //the migration is an IOU migration
            _originWorld,
            _originTokenId,
            _destinationUniverse,
            _destinationBridge,
            _destinationWorld,
            _destinationTokenId,
            _destinationOwner,
            _signee
        );

        require(!migrationsRegistered[migrationHash], "This migration was already registered");

        //Registering the migration as pre-registered
        migrationsRegistered[migrationHash] = true;

        //Registering this migration address as the latest registered for a specific token (hashing less gas expensive than address + tokenID storing)
        latestRegisteredMigration[keccak256(abi.encodePacked(_originWorld, _originTokenId))] = migrationHash;

        //Emiting the registration event
        emit MigrationDeparturePreRegisteredERC721IOU(
            tOwner,
            _originWorld, 
            _originTokenId, 
            _destinationUniverse,
            _destinationBridge,
            _destinationWorld,
            _destinationTokenId,
            _destinationOwner,
            _signee,
            migrationHash
        );

    }


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
        uint256 /*_originTokenId*/, 
        bytes32 /*_destinationUniverse*/, 
        bytes32 /*_destinationWorld*/,
        bytes32 /*_destinationTokenId*/
    ) external view returns(bool){

        //Either a departure world allows for IOU migration or it doesn't
        return(!isIOUForbidden[_originWorld]);
    }



    //Generate a migration hash for a local migration
    function generateMigrationHash(   
        bool _isIOU,     
        address _originWorld, 
        uint256 _originTokenId, 
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee) internal view returns(bytes32) {
            bytes32 b32OriginWorld = bytes32(uint(uint160(_originWorld)));
            bytes32 b32OriginTokenId = bytes32(_originTokenId);
            bytes32 b32Timestamp = bytes32(block.timestamp);
            return keccak256(
                abi.encodePacked(
                    _isIOU,
                    localUniverse, 
                    b32OriginWorld, 
                    b32OriginTokenId, 
                    _destinationUniverse, 
                    _destinationBridge, 
                    _destinationWorld, 
                    _destinationTokenId,
                    _destinationOwner,
                    _signee,
                    b32Timestamp
                )
            );
    }

}