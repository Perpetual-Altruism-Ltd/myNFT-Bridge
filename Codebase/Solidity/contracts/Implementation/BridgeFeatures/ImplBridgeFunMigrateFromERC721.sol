// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.2;

import "../ImplMemoryStructure.sol";
import "../ERC721.sol";
import "../../MyNFTBridge.sol";


/// @author Guillaume Gonnaud 2021
/// @title ImplMyNFTBridgeFunMigrateFromRC721
/// @notice The well-ordered memory structure of our bridge. Used for generating proper memory address at compilation.
contract ImplMyNFTBridgeFunMigrateFromERC721  is ImplMemoryStructure, MyNFTBridgeERC721toERC721Arrival {

    
    /// @notice Declare a migration of an ERC-721 token from a different bridge toward this bridge as an IOU token.
    /// @dev Throw if msg.sender is not a relay accredited by _destinationWorld Owner
    /// This is especially important as a rogue relay could theoritically release tokens put in escrow beforehand.
    /// This also mean that a token can be migrated back only by a relay accredited by the original token publisher.
    /// Throw if the destination token is already in escrow with this bridge as a migration origin token but that 
    /// current _origin* parameters do not match the previous _destination* parameters : Only the IOU can claim the 
    /// original token back.
    /// @param _originUniverse An array of 32 bytes representing the destination universe. 
    /// eg : "Ropsten", "Moonbeam". Please refer to the documentation for a standardized list of destination.
    /// @param _originWorld An array of 32 bytes representing the origin world of the origin token. 
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _originTokenId An array of 32 bytes representing the tokenId of the origin token. 
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _originBridge An array of 32 bytes representing the origin bridge. If the origin
    /// bridge is on an EVM, it is most likely an address.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token. 
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token. 
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _destinationOwner An array of 32 bytes representing the final owner of the migrated token . 
    /// If the destination world is on an EVM, it is most likely an address.
    /// @param _signee The address that will be verified as signing the transfer as legitimate on the destination
    /// If the owner has access to a private key, it should be the owner.
    /// A relay unable to lie on _signee from the departure bridge to here is a trustless relay
    /// @param _height The height at which the origin token was put in escrow in the origin universe.
    /// Usually the block.timestamp, but different universes have different metrics
    /// @param _escrowHashSigned The _escrowHash of the origin chain signed by _signee
    function migrateFromIOUERC721ToERC721(
        bytes32 _originUniverse,
        bytes32 _originWorld, 
        bytes32 _originTokenId, 
        bytes32 _originBridge, 
        address _destinationWorld,
        uint256 _destinationTokenId,
        address _destinationOwner,
        address _signee,
        bytes32 _height,
        bytes32 _escrowHashSigned
    ) external override {
    }


    /// @notice Declare a migration of an ERC-721 token from a different bridge toward this bridge as a full migration
    /// @dev Throw if msg.sender is not a relay accredited by _destinationWorld Owner
    /// This is especially important as a rogue relay could theoritically release tokens put in escrow beforehand.
    /// This also mean that a token can be migrated back only by a relay accredited by the original token publisher.
    /// Contrary to IOU migrations, do not throw in case of mismatched token back and forth migration. 
    /// @param _originUniverse An array of 32 bytes representing the destination universe. 
    /// eg : "Ropsten", "Moonbeam". Please refer to the documentation for a standardized list of destination.
    /// @param _originWorld An array of 32 bytes representing the origin world of the origin token. 
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _originTokenId An array of 32 bytes representing the tokenId of the origin token. 
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _originBridge An array of 32 bytes representing the origin bridge. If the origin
    /// bridge is on an EVM, it is most likely an address.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token. 
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token. 
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _destinationOwner An array of 32 bytes representing the final owner of the migrated token . 
    /// If the destination world is on an EVM, it is most likely an address.
    /// @param _signee The address that will be verified as signing the transfer as legitimate on the destination
    /// If the owner has access to a private key, it should be the owner.
    /// A relay unable to lie on _signee from the departure bridge to here is a trustless relay
    /// @param _height The height at which the origin token was put in escrow in the origin universe.
    /// Usually the block.timestamp, but different universes have different metrics
    /// @param _escrowHashSigned The _escrowHash of the origin chain signed by _signee
    function migrateFromFullERC721ToERC721(
        bytes32 _originUniverse,
        bytes32 _originWorld, 
        bytes32 _originTokenId, 
        bytes32 _originBridge, 
        address _destinationWorld,
        uint256 _destinationTokenId,
        address _destinationOwner,
        address _signee,
        bytes32 _height,
        bytes32 _escrowHashSigned
    ) external override {
    }


    /// @notice Finalize a migration by transferring the IOU destination token to it's new owner
    /// @dev Throw if safeTransferFrom() fails to attribute the token.
    /// Can only succeed once per _escrowHash
    /// emit FinalizedMigrationERC721IOU
    /// @param _escrowHash An array of 32 bytes that was reconstructed when writing the migration details
    /// in the arrival bridge
    /// @param _migrationRelayedHashSigned An array of 32 bytes of the _migrationRelayedHash signed 
    /// by of the _signee of the migration
    function finalizeERC721IOUMigration(
        bytes32 _escrowHash,
        bytes32 _migrationRelayedHashSigned
    ) external override {
    }

    
    /// @notice Finalize a migration by transferring the Full destination token to it's new owner
    /// @dev Throw if safeTransferFrom() fails to attribute the token.
    /// Will call a callback programmable by the token publisher before calling SafeTransfer
    /// Can only succeed once per _escrowHash
    /// emit FinalizedMigrationERC721Full
    /// @param _escrowHash An array of 32 bytes that was reconstructed when writing the migration details
    /// in the arrival bridge
    /// @param _migrationRelayedHashSigned An array of 32 bytes of the _migrationRelayedHash signed 
    /// by of the _signee of the migration
    function finalizeERC721FullMigration(
        bytes32 _escrowHash,
        bytes32 _migrationRelayedHashSigned
    ) external override {
    }


    function internalMigrateFromERC721ToERC721(
        bool _isIOU,
        bytes32 _originUniverse,
        bytes32 _originWorld, 
        bytes32 _originTokenId, 
        bytes32 _originBridge, 
        address _destinationWorld,
        uint256 _destinationTokenId,
        address _destinationOwner,
        address _signee,
        bytes32 _height,
        bytes32 _escrowHashSigned
    ) external{

    }


    //Generate a migration hash for a query
    function generateMigrationHashArtificial(   
        bool _isIOU,     
        bytes32 _originUniverse, 
        bytes32 _originBridge,
        bytes32 _originWorld, 
        bytes32 _originTokenId, 
        bytes32 _originOwner,
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee,
        bytes32 _originHeight
    ) internal pure returns(bytes32) {
            return keccak256(
                abi.encodePacked(
                    _isIOU,
                    _originUniverse, 
                    _originBridge,
                    _originWorld, 
                    _originTokenId,
                    _originOwner,
                    _destinationUniverse, 
                    _destinationBridge, 
                    _destinationWorld, 
                    _destinationTokenId,
                    _destinationOwner,
                    _signee,
                    _originHeight
                )
            );
    }

}